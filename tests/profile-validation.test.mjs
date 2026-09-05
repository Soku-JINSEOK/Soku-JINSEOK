import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const verifier = path.resolve("scripts/verify-profile.mjs");

function runFixture(readme, svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>", setup = () => {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "profile-validation-"));
  fs.mkdirSync(path.join(root, "assets"));
  fs.writeFileSync(path.join(root, "README.md"), readme);
  fs.writeFileSync(path.join(root, "assets", "banner.svg"), svg);
  setup(root);
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

const publicUrl = "https://github.com/Soku-JINSEOK/Soku-Convention-Boilerplate";

test("accepts every reviewed public destination", () => {
  for (const url of [
    "https://github.com/Soku-JINSEOK", "https://github.com/Soku-JINSEOK?tab=repositories",
    "https://github.com/Soku-JINSEOK.png?size=180", publicUrl,
    "https://github.com/Soku-JINSEOK/Soku-JINSEOK",
    "https://github.com/Soku-JINSEOK/ci-cd-control-plane-engine",
    "https://img.shields.io/badge/Go-00ADD8?style=flat-square&amp;logo=go&amp;logoColor=white",
  ]) {
    const result = runFixture(`${valid}\n[Public](${url})\n`);
    assert.equal(result.status, 0, result.stderr);
  }
});

test("validates inline, reference, autolink, plain, fenced and HTML destinations", () => {
  const forms = (url) => [
    `[Public](${url})`, `[Public](<${url}>)`, `[Public][ref]\n\n[ref]: <${url}>`,
    `<${url}>`, url, `\`\`\`text\n${url}\n\`\`\``,
    `<a href="${url}">Public</a>`, `<a href='${url}'>Public</a>`,
    `<a href=${url}>Public</a>`, `<img src="${url}">`,
  ];
  for (const body of forms(publicUrl)) assert.equal(runFixture(`${valid}\n${body}\n`).status, 0, body);
  for (const body of forms("https://github.com/Soku-JINSEOK/unverified-repository")) {
    const result = runFixture(`${valid}\n${body}\n`);
    assert.notEqual(result.status, 0, body);
    assert.match(result.stderr, /unsafe or unverified/);
  }
});

test("rejects unverified public claims, projects, sample hosts and private addresses", () => {
  for (const url of [
    "https://github.com/users/Soku-JINSEOK/projects/2", "https://example.com",
    "https://arbitrary-host.invalid", "https://localhost", "https://127.0.0.1",
    "https://2130706433", "https://0x7f000001", "https://[::1]", "https://[fc00::1]",
    "https://10.0.0.1", "https://172.16.0.1", "https://192.168.1.1",
    "https://github.com.evil.invalid/Soku-JINSEOK", "https://github.com:8443/Soku-JINSEOK",
    "https://img.shields.io/endpoint?url=https://example.com",
    "https://github.com/another-owner/unverified-repository",
  ]) assert.notEqual(runFixture(`${valid}\n[Link](${url})\n`).status, 0, url);
});

test("rejects schemes, credentials and sensitive query values without logging them", () => {
  for (const url of [
    "http://github.com/Soku-JINSEOK", "//github.com/Soku-JINSEOK",
    "javascript:alert(1)", "data:text/html,unsafe", "mailto:person@example.com",
    "https://user:secret-value@github.com/Soku-JINSEOK",
    `${publicUrl}?token=secret-value`, `${publicUrl}?api_key=secret-value`,
    "https://img.shields.io/badge/test-blue?logo=ghp_abcdefghijklmno",
    "https://github.com/Soku-JINSEOK#ghp_abcdefghijklmno",
    "https://img.shields.io/badge/ghp_abcdefghijklmno-blue",
    "https://img.shields.io/badge/%67hp_abcdefghijklmno-blue",
    "https%3A%2F%2Fexample.com%3Ftoken=secret-value",
    "#ghp_abcdefghijklmno",
  ]) {
    const result = runFixture(`${valid}\n[Link](${url})\n`);
    assert.notEqual(result.status, 0, url);
    assert.doesNotMatch(result.stderr, /secret-value|ghp_abcdefghijklmno/);
  }
});

test("rejects malformed and encoded path tricks with stable errors", () => {
  for (const url of [
    `${publicUrl}/%ZZ`, `${publicUrl}%252fprivate`, `${publicUrl}%2fprivate`,
    `${publicUrl}/%2e%2e/unverified-repository`, `${publicUrl}%5cprivate`,
    "%ZZ", "assets%00/banner.svg", "assets\\banner.svg", "../README.md",
  ]) {
    const result = runFixture(`${valid}\n[Link](${url})\n`);
    assert.notEqual(result.status, 0, url);
    assert.match(result.stderr, /ERROR:/);
    assert.doesNotMatch(result.stderr, /URIError|at decodeURIComponent/);
  }
});

test("decodes supported HTML entities and rejects obfuscation", () => {
  assert.equal(runFixture(`${valid}\n<a href="https&#58;//github.com/Soku-JINSEOK">Profile</a>\n`).status, 0);
  for (const url of [
    "javascript&#58;alert(1)", "https&colon;//github.com/Soku-JINSEOK",
    "https://github.com/Soku-JINSEOK?tab=repositories&unknown;",
    "https://github.com/Soku-JINSEOK?tab=repositories&amp",
    "https://github.com/Soku-JINSEOK&#0;", "https://github.com/Soku-JINSEOK&#x110000;",
  ]) assert.notEqual(runFixture(`${valid}\n<a href="${url}">Profile</a>\n`).status, 0, url);
});

test("rejects local links through a symlink outside the repository", () => {
  const result = runFixture(`${valid}\n[Outside](outside.md)\n`, undefined,
    (root) => fs.symlinkSync(verifier, path.join(root, "outside.md")));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /resolves outside repository/);
});

test("rejects unsafe destinations behind escaped and nested Markdown labels", () => {
  for (const destination of ["javascript:alert(1)", "data:text/html,unsafe", "//example.com"]) {
    for (const label of ["[foo\\]]", "[![nested](assets/banner.svg)]"]) {
      const result = runFixture(`${valid}\n${label}(${destination})\n`);
      assert.notEqual(result.status, 0, `${label}(${destination})`);
      assert.match(result.stderr, /unsafe or unverified/);
    }
    for (const label of ["foo\\]", "multi\nline"]) {
      const result = runFixture(`${valid}\n[${label}]\n\n[${label}]: ${destination}\n`);
      assert.notEqual(result.status, 0, `reference ${label}: ${destination}`);
      assert.match(result.stderr, /unsafe or unverified/);
    }
  }
  assert.equal(runFixture(`${valid}\n[![nested](assets/banner.svg)](${publicUrl})\n`).status, 0);
});

test("rejects email autolinks without logging the address", () => {
  const result = runFixture(`${valid}\n<person@example.com>\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unsafe or unverified/);
  assert.doesNotMatch(result.stderr, /person@example.com/);
});
