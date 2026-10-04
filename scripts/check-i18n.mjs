#!/usr/bin/env node
// Escanea src/ y e2e? no—sólo src: recoge (namespace, key) usados via
// useTranslations/getTranslations y comprueba que existan en todos los
// messages/*.json. Zero-dependencias (sólo node:fs + regex).
import fs from "node:fs";
import path from "node:path";

const LOCALES = ["es", "en", "ca", "gl", "eu", "fr"];
const MESSAGES_DIR = path.resolve(process.cwd(), "messages");

const messages = Object.fromEntries(
  LOCALES.map((loc) => [loc, JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, `${loc}.json`), "utf8"))]),
);

// Recolecta: var -> namespace, y todas las llamadas var("key")
const srcDir = path.resolve(process.cwd(), "src");
let used = new Map(); // ns|key -> Set<files>

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|ts)$/.test(entry.name)) collect(full);
  }
}

function collect(file) {
  const s = fs.readFileSync(file, "utf8");
  // var(s) -> ns
  const varNs = [];
  for (const m of s.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*["']([a-z_]+)["']/g)) {
    varNs.push([m[1], m[2], m.index]);
  }
  // desestructuring: const [a, b] = useTranslations(...)? (nada en este proyecto)
  for (const [varName, ns, idx] of varNs) {
    const range = s.matchAll(new RegExp(`\\b${varName}\\(`, "g"));
    for (const km of s.matchAll(new RegExp(`\\b${varName}\\b\\(\\s*"([^"{}]+)"(\\s*,|\\s*\\))`, "g"))) {
      const full = path.relative(process.cwd(), file);
      const entry = used.get(`${ns}|${km[1]}`) ?? new Set();
      entry.add(full);
      used.set(`${ns}|${km[1]}`, entry);
    }
  }
}

function exists(data, ns, key) {
  let cur = data;
  for (const part of [ns, ...key.split(".")]) {
    if (cur && typeof cur === "object" && part in cur) cur = cur[part];
    else return false;
  }
  return true;
}

walk(srcDir);

let missing = 0;
const missingList = [];
for (const [id, files] of used) {
  const [ns, key] = id.split("|");
  const badLocales = LOCALES.filter((loc) => !exists(messages[loc], ns, key));
  if (badLocales.length) {
    missing += badLocales.length;
    missingList.push({ ns, key, badLocales, files: [...files] });
  }
}

if (missingList.length) {
  console.error(`✘ ${missingList.length} keys con traducciones que faltan (${missing} entradas):\n`);
  for (const m of missingList) {
    console.error(`  - ${m.ns}:${m.key}  [${m.badLocales.join(", ")}]  (${m.files[0]})`);
  }
  console.error("\nAñádelas a los 6 ficheros de messages/*.json (usa npm run i18n:fix sino).");
  process.exit(1);
}
console.log("✓ i18n completo: todos los literals usados en código están traducidos en los 6 idiomas.");
