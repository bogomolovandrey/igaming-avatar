#!/usr/bin/env python3
"""Generate 9 character portraits.

Provider selection (first match wins):
    OPENAI_API_KEY → OpenAI gpt-image-1 (default — best quality, paid).
    GOOGLE_API_KEY → Gemini Image (currently requires billing on free tier).

Usage:
    python3 scripts/generate_portraits.py
    python3 scripts/generate_portraits.py --force
    python3 scripts/generate_portraits.py --only alex,max

Idempotent: skips characters whose prompt hash matches the cached lockfile.
PNGs are written to frontend/public/characters/<id>.png and committed.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import sys
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CHARS_YAML = ROOT / "data" / "characters.yaml"
OUT_DIR = ROOT / "frontend" / "public" / "characters"
LOCK_FILE = OUT_DIR / ".generated-lock"


def _load_lock() -> dict:
    if not LOCK_FILE.exists():
        return {}
    try:
        return json.loads(LOCK_FILE.read_text())
    except (OSError, json.JSONDecodeError):
        return {}


def _save_lock(data: dict) -> None:
    LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
    LOCK_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def _hash_prompt(provider: str, prompt: str) -> str:
    return hashlib.sha256(f"{provider}::{prompt}".encode("utf-8")).hexdigest()[:16]


# ─────────────────────────────────────────────────────────────────


def _generate_openai(prompt: str, api_key: str) -> bytes:
    body = json.dumps(
        {
            "model": "gpt-image-1",
            "prompt": prompt,
            "size": "1024x1024",
            "n": 1,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        payload = json.loads(resp.read())
    data = payload.get("data", [])
    if not data or "b64_json" not in data[0]:
        raise RuntimeError(f"unexpected response: {payload!r}")
    return base64.b64decode(data[0]["b64_json"])


def _generate_gemini(prompt: str, api_key: str) -> bytes:
    model = "gemini-3.1-flash-image-preview"
    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent"
    )
    body = json.dumps(
        {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"]},
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{endpoint}?key={api_key}",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        payload = json.loads(resp.read())
    candidates = payload.get("candidates", [])
    if not candidates:
        raise RuntimeError(f"no candidates: {payload!r}")
    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        inline = part.get("inlineData") or part.get("inline_data")
        if inline and inline.get("data"):
            return base64.b64decode(inline["data"])
    raise RuntimeError(f"no inlineData: {payload!r}")


def _pick_provider() -> tuple[str, callable, str]:
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        return "openai", lambda p: _generate_openai(p, openai_key), openai_key
    google_key = os.environ.get("GOOGLE_API_KEY")
    if google_key:
        return "gemini", lambda p: _generate_gemini(p, google_key), google_key
    raise SystemExit(
        "no provider key set: export OPENAI_API_KEY or GOOGLE_API_KEY"
    )


# ─────────────────────────────────────────────────────────────────


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--only", help="comma-separated ids")
    args = parser.parse_args()

    provider, generate, _key = _pick_provider()
    print(f"provider: {provider}")

    config = yaml.safe_load(CHARS_YAML.read_text(encoding="utf-8"))
    style_preset = (config.get("style_preset") or "").strip()
    characters = config.get("characters") or []
    only = {x.strip() for x in args.only.split(",")} if args.only else None

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    lock = _load_lock()

    for c in characters:
        cid = c["id"]
        if only and cid not in only:
            continue
        char_prompt = (c.get("imagePrompt") or "").strip()
        full_prompt = f"{style_preset}\n\n{char_prompt}".strip()
        prompt_hash = _hash_prompt(provider, full_prompt)
        target = OUT_DIR / f"{cid}.png"

        if (
            not args.force
            and target.exists()
            and lock.get(cid) == prompt_hash
        ):
            print(f"  · {cid}: skip (lock match)")
            continue

        print(f"  ✎ {cid}: generating via {provider}…", flush=True)
        try:
            png = generate(full_prompt)
        except Exception as exc:  # noqa: BLE001
            print(f"  ✗ {cid}: {exc}", file=sys.stderr)
            continue
        target.write_bytes(png)
        lock[cid] = prompt_hash
        print(f"  ✓ {cid}: wrote {target.relative_to(ROOT)} ({len(png)} bytes)")

    _save_lock(lock)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
