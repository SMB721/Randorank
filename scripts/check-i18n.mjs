// Verifies the app dictionaries (src/lib/i18n/app): every locale has the same
// keys as French, the same {placeholders}, and every plural base used with
// tn("…") has both "_one" and "_other". Run: node scripts/check-i18n.mjs
import fs from "fs";
import path from "path";

const dir = "src/lib/i18n/app";
const parse = (file) => {
  const out = {};
  for (const line of fs.readFileSync(path.join(dir, file), "utf8").split("\n")) {
    const m = line.match(/^\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)",?\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
};
const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join(",");

const fr = parse("fr.ts");
let problems = 0;
const report = (msg) => {
  problems++;
  console.log("  !", msg);
};

console.log(`fr: ${Object.keys(fr).length} keys`);
for (const locale of ["en", "it", "es", "de"]) {
  const d = parse(`${locale}.ts`);
  const missing = Object.keys(fr).filter((k) => !(k in d));
  const extra = Object.keys(d).filter((k) => !(k in fr));
  console.log(`${locale}: ${Object.keys(d).length} keys, ${missing.length} missing, ${extra.length} extra`);
  missing.forEach((k) => report(`${locale} missing ${k}`));
  extra.forEach((k) => report(`${locale} extra ${k}`));
  for (const k of Object.keys(fr)) {
    if (k in d && vars(fr[k]) !== vars(d[k])) report(`${locale} placeholders differ on ${k}`);
  }
}

// Plural bases used in code must exist in both forms.
const walk = (p) =>
  fs.readdirSync(p, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name === "node_modules" ? [] : walk(path.join(p, e.name))) : [path.join(p, e.name)]
  );
for (const file of walk("src").filter((f) => /\.(ts|tsx)$/.test(f))) {
  for (const m of fs.readFileSync(file, "utf8").matchAll(/\btn\(\s*"([^"]+)"/g)) {
    for (const suffix of ["_one", "_other"]) {
      if (!(m[1] + suffix in fr)) report(`${file}: tn("${m[1]}") has no ${m[1] + suffix}`);
    }
  }
}

console.log(problems ? `${problems} problem(s)` : "i18n OK");
process.exit(problems ? 1 : 0);
