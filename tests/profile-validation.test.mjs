import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const verifier = path.resolve("scripts/verify-profile.mjs");

function runFixture(readme, svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "profile-validation-"));
  fs.mkdirSync(path.join(root, "assets"));
  fs.writeFileSync(path.join(root, "README.md"), readme);
  fs.writeFileSync(path.join(root, "assets", "banner.svg"), svg);
  const result = spawnSync(process.execPath, [verifier, root], { encoding: "utf8" });
  fs.rmSync(root, { recursive: true, force: true });
  return result;
}

const valid = "# Profile\n\n## Work\n\n[Work](#work)\n\n![Banner](assets/banner.svg)\n";

test("accepts a valid local link, fragment, SVG, and fence", () => {
  const result = runFixture(`${valid}\n\`\`\`text\nvalue\n\`\`\`\n`);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects a broken local link", () => {
  assert.notEqual(runFixture(`${valid}\n[Missing](missing.md)\n`).status, 0);
});

test("rejects a broken fragment", () => {
  assert.notEqual(runFixture(`${valid}\n[Missing](#not-present)\n`).status, 0);
});

test("rejects malformed SVG XML", () => {
  assert.notEqual(runFixture(valid, "<svg><g></svg>").status, 0);
});

test("rejects an unclosed code fence", () => {
  assert.notEqual(runFixture(`${valid}\n\`\`\`text\nvalue\n`).status, 0);
});
