"""Generate human-readable session IDs like 'bright-fox'."""

from __future__ import annotations

import random

ADJECTIVES = [
    "bright", "calm", "clever", "cosmic", "dapper", "daring", "eager", "fierce",
    "gentle", "golden", "happy", "humble", "jolly", "keen", "kind", "lively",
    "lucky", "mellow", "merry", "mighty", "noble", "nimble", "patient", "peppy",
    "plucky", "quick", "quiet", "radiant", "ready", "rugged", "sharp", "shiny",
    "silent", "smart", "snappy", "sparky", "spry", "steady", "stoic", "sunny",
    "swift", "tender", "tough", "trusty", "valiant", "vivid", "warm", "wise",
    "witty", "zealous",
]

ANIMALS = [
    "fox", "wolf", "lynx", "panda", "tiger", "lion", "otter", "raven",
    "falcon", "owl", "hawk", "eagle", "badger", "beaver", "rabbit", "marten",
    "bison", "moose", "dolphin", "orca", "stag", "stoat", "puma", "jaguar",
    "leopard", "cheetah", "mongoose", "ferret", "weasel", "marmot", "lemur",
    "tortoise", "octopus", "kingfisher", "heron", "crane", "puffin", "swallow",
    "sparrow", "magpie", "swan", "ibex", "elk", "kudu", "zebra", "tapir",
    "manatee", "pangolin", "koala", "wombat",
]


def generate(taken: set[str] | None = None, max_attempts: int = 50) -> str:
    """Pick an adjective+animal pair not in `taken`. Falls back to suffix on collisions."""
    taken = taken or set()
    for _ in range(max_attempts):
        candidate = f"{random.choice(ADJECTIVES)}-{random.choice(ANIMALS)}"
        if candidate not in taken:
            return candidate
    return f"{random.choice(ADJECTIVES)}-{random.choice(ANIMALS)}-{random.randint(10, 99)}"
