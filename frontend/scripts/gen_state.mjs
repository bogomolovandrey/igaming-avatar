#!/usr/bin/env node
// Generates two TS modules from yaml sources:
//   data/demo-state.yaml  → frontend/lib/demo-state.ts
//   data/characters.yaml  → frontend/lib/characters.ts
// Runs as `prebuild` / `predev` hook in package.json.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..", "..");
const frontendRoot = resolve(here, "..");

function generate(yamlRel, tsRel, body) {
  const yamlPath = resolve(projectRoot, yamlRel);
  const outPath = resolve(frontendRoot, tsRel);
  const data = load(readFileSync(yamlPath, "utf-8"));
  const banner = `// AUTO-GENERATED from ${yamlRel} — do not edit by hand.\n// Re-run \`npm run gen:state\` (or any \`npm run dev\` / \`build\`) to refresh.\n`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, banner + body(data), "utf-8");
  return data;
}

const demo = generate(
  "data/demo-state.yaml",
  "lib/demo-state.ts",
  (data) => `import type { DemoState } from "./types";

export const demoState: DemoState = ${JSON.stringify(data, null, 2)};

export const matches = demoState.matches;
export const leagues = demoState.leagues;
export const playerTemplate = demoState.player_template;
export const bonusCatalog = demoState.bonus_catalog;
export const triggerPresets = demoState.trigger_presets;
`
);

const chars = generate(
  "data/characters.yaml",
  "lib/characters.ts",
  (data) => `export type Character = {
  id: string;
  name: string;
  role: string;
  monogram: string;
  grad: string;
  active: boolean;
};

export const characters: Character[] = ${JSON.stringify(
    data.characters.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      monogram: c.monogram,
      grad: c.grad,
      active: !!c.active,
    })),
    null,
    2
  )};
`
);

console.log(
  `✓ wrote demo-state.ts (${demo.matches.length} matches), characters.ts (${chars.characters.length} chars)`
);
