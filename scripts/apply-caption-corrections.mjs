#!/usr/bin/env node
// Fix recurring ASR misspellings (brand and domain terms) in display text.
//
// Usage:
//   node scripts/apply-caption-corrections.mjs <transcript.json> [corrections.json] [out.json]
//   node scripts/apply-caption-corrections.mjs --self-test
//
// Reads  { words: [{ text, start, end }] } and { "corrections": { "wrong phrase": "Right" } }.
// Writes <transcript>.corrected.json by default. The original is never touched.
// A multi-word match becomes one word spanning first.start..last.end, so timing is
// unchanged. Use the corrected file for captions and on-screen text only; keep the
// ASR transcript for beat anchors and validate-beat-sync.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { argv, exit } from "node:process";
import assert from "node:assert/strict";

const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const trailing = (s) => s.match(/[^\p{L}\p{N}]+$/u)?.[0] ?? "";

export function applyCorrections(words, corrections) {
  const rules = Object.entries(corrections)
    .map(([from, to]) => ({ key: from.split(/\s+/).map(norm), to }))
    .filter((r) => r.key.length && r.key.every(Boolean))
    .sort((a, b) => b.key.length - a.key.length);

  const out = [];
  let hits = 0;
  for (let i = 0; i < words.length; ) {
    const rule = rules.find((r) =>
      r.key.every((k, j) => words[i + j] && norm(words[i + j].text) === k),
    );
    if (!rule) {
      out.push(words[i++]);
      continue;
    }
    const last = words[i + rule.key.length - 1];
    out.push({
      ...words[i],
      text: rule.to + trailing(last.text),
      end: last.end,
    });
    i += rule.key.length;
    hits++;
  }
  return { words: out, hits };
}

function selfTest() {
  const w = (text, start) => ({ text, start, end: start + 0.25 });
  const r = applyCorrections(
    [w("Use", 0), w("Open", 1), w("AI,", 1.25), w("hyper", 2), w("frames.", 2.25), w("ok", 3)],
    { "open ai": "OpenAI", "Hyper Frames": "HyperFrames" },
  );
  assert.equal(r.hits, 2);
  assert.deepEqual(r.words.map((x) => x.text), ["Use", "OpenAI,", "HyperFrames.", "ok"]);
  assert.equal(r.words[1].start, 1);
  assert.equal(r.words[1].end, 1.5);
  assert.equal(r.words[2].end, 2.5);
  console.log("apply-caption-corrections self-test ok");
}

if (argv[2] === "--self-test") {
  selfTest();
  exit(0);
}

if (!argv[2]) {
  console.error("usage: node scripts/apply-caption-corrections.mjs <transcript.json> [corrections.json] [out.json]");
  exit(1);
}

const trPath = resolve(argv[2]);
const corrPath = resolve(
  argv[3] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "caption-corrections.json"),
);
const outPath = resolve(
  argv[4] ?? join(dirname(trPath), `${basename(trPath, extname(trPath))}.corrected.json`),
);

const tr = JSON.parse(readFileSync(trPath, "utf8"));
if (!Array.isArray(tr.words)) {
  console.error(`no words[] in ${trPath}`);
  exit(1);
}
const { corrections } = JSON.parse(readFileSync(corrPath, "utf8"));
const { words, hits } = applyCorrections(tr.words, corrections ?? {});
writeFileSync(outPath, JSON.stringify({ ...tr, words }, null, 2));
console.log(`wrote ${outPath} (${hits} correction${hits === 1 ? "" : "s"} applied)`);
