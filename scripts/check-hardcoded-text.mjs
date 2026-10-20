#!/usr/bin/env node
/**
 * Regle d'or : aucun texte visible en dur dans apps/site. Echoue (code 1) si un litteral
 * lisible est trouve dans le JSX (texte entre balises ou attributs aria-label/placeholder/title/alt).
 * Tout texte vient de l'API (ui-strings, contenus). Utilise en CI.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../apps/site/src', import.meta.url));
const SKIP_DIRS = new Set(['dev']);
const ALLOWED = new Set(['ISSTAS', 'WhatsApp', 'FR', 'EN', '404', '*', '|', '/', '·', '—', '–', '←', '→']);

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(p);
    } else if (/\.tsx$/.test(name)) files.push(p);
  }
})(ROOT);

const problems = [];
const textNode = />\s*([^<>{}\n]*[A-Za-zÀ-ÿ]{2,}[^<>{}\n]*?)\s*</g;
const attr = /\b(aria-label|placeholder|title|alt)="([^"{}]*[A-Za-zÀ-ÿ]{2,}[^"{}]*)"/g;

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const code = line.replace(/\{\/\*.*?\*\/\}/g, '');
    if (/^\s*(\/\/|\*|import |export type|type )/.test(code)) return;
    for (const m of code.matchAll(textNode)) {
      const text = m[1].trim();
      if (!ALLOWED.has(text) && !/^[A-Z_]+$/.test(text) && !/=>|&&|\?|\(|\)|;|\bconst\b|\breturn\b/.test(text)) problems.push([file, i + 1, text]);
    }
    for (const m of code.matchAll(attr)) {
      if (!ALLOWED.has(m[2]) && m[2] !== '') problems.push([file, i + 1, `${m[1]}="${m[2]}"`]);
    }
  });
}

if (problems.length) {
  console.error(`Texte en dur dans apps/site (${problems.length}) :`);
  for (const [f, l, t] of problems) console.error(`  ${relative(ROOT, f)}:${l}  ${t}`);
  process.exit(1);
}
console.log(`OK : aucun texte visible en dur (${files.length} fichiers).`);