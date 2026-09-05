#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] ?? ".");
const markdownPath = path.join(root, "README.md");
const errors = [];
// Public destinations verified for this profile. Changes require a visibility review.
const publicRepositories = new Set([
  "soku-jinseok", "soku-convention-boilerplate", "ci-cd-control-plane-engine",
]);

function decodeReference(reference) {
  const entities = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
  const decoded = reference.replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]*);/gi, (_, entity) => {
    if (entity.startsWith("#")) {
      const number = entity[1].toLowerCase() === "x"
        ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (!number || number > 0x10ffff || (number >= 0xd800 && number <= 0xdfff)) throw new Error();
      return String.fromCodePoint(number);
    }
    if (!(entity.toLowerCase() in entities)) throw new Error();
    return entities[entity.toLowerCase()];
  });
  if (/&(?:#|(?:amp|quot|apos|lt|gt)(?:$|[^a-z\d=]))/i.test(decoded)) throw new Error();
  decodeURIComponent(decoded); // Reject malformed escapes before URL or path handling.
  if (/[\x00-\x1f\x7f\\]/.test(decoded)) throw new Error();
  return decoded;
}

function validateExternal(reference) {
  const url = new URL(reference);
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) throw new Error();
  const pathname = decodeURIComponent(url.pathname);
  const credentialPattern = /(?:gh[pousr]_|github_pat_|AKIA|AIza|eyJ)[A-Za-z0-9_-]{10,}/;
  if (credentialPattern.test(pathname)) throw new Error();
  if (/[%\\\x00-\x1f\x7f]/.test(pathname) || /%2f|%5c|%2e/i.test(reference.split(/[?#]/)[0])) throw new Error();
  for (const [key, value] of url.searchParams) {
    if (/token|secret|password|authorization|api.?key|signature/i.test(key) ||
        credentialPattern.test(value)) throw new Error();
  }
  const parts = pathname.toLowerCase().split("/").filter(Boolean);
  if (url.hostname === "github.com") {
    if (parts.length === 1 && parts[0] === "soku-jinseok") {
      if ([...url.searchParams].some(([k, v]) => k !== "tab" || v !== "repositories")) throw new Error();
      return;
    }
    if (parts.length === 1 && parts[0] === "soku-jinseok.png") {
      if ([...url.searchParams].some(([k, v]) => k !== "size" || !/^\d{1,4}$/.test(v))) throw new Error();
      return;
    }
    if (parts.length === 2 && parts[0] === "soku-jinseok" && publicRepositories.has(parts[1]) && !url.search) return;
  }
  if (url.hostname === "img.shields.io" && pathname.startsWith("/badge/") && pathname.length > 7) {
    const keys = new Set(["style", "logo", "logoColor", "color", "labelColor"]);
    if ([...url.searchParams].some(([k, v]) => !keys.has(k) || !/^[\w #.-]+$/.test(v))) throw new Error();
    return;
  }
  throw new Error();
}

function fail(message) {
  errors.push(message);
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-");
}

function validateXml(file) {
  const source = fs.readFileSync(file, "utf8");
  const stack = [];
  const tagPattern = /<\/?([A-Za-z_][\w:.-]*)(?:\s[^<>]*?)?\s*\/?>/g;
  for (const match of source.matchAll(tagPattern)) {
    const token = match[0];
    const name = match[1];
    if (token.startsWith("</")) {
      if (stack.pop() !== name) fail(`${path.relative(root, file)}: mismatched XML closing tag </${name}>`);
    } else if (!token.endsWith("/>")) {
      stack.push(name);
    }
  }
  if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg(?:\s|>)/.test(source)) fail(`${path.relative(root, file)}: SVG root element is missing`);
  if (stack.length) fail(`${path.relative(root, file)}: unclosed XML tag <${stack.at(-1)}>`);
}

if (!fs.existsSync(markdownPath)) {
  fail("README.md is missing");
} else {
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const fenceLines = markdown.split(/\r?\n/).filter((line) => /^\s*(```|~~~)/.test(line));
  if (fenceLines.length % 2 !== 0) fail("README.md: unclosed fenced code block");

  const headings = new Set();
  for (const match of markdown.matchAll(/^#{1,6}\s+(.+)$/gm)) headings.add(slugify(match[1]));

  const htmlStack = [];
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const htmlWithoutFences = markdown.replace(/(```|~~~)[\s\S]*?\1/g, "");
  for (const match of htmlWithoutFences.matchAll(/<\/?([A-Za-z][\w-]*)(?:\s[^<>]*?)?\s*\/?>/g)) {
    const token = match[0];
    const name = match[1].toLowerCase();
    if (token.startsWith("</")) {
      if (htmlStack.pop() !== name) fail(`README.md: mismatched HTML closing tag </${name}>`);
    } else if (!voidTags.has(name) && !token.endsWith("/>")) {
      htmlStack.push(name);
    }
  }
  if (htmlStack.length) fail(`README.md: unclosed HTML tag <${htmlStack.at(-1)}>`);

  const references = new Set();
  // Destination boundaries also cover escaped or nested brackets in link labels.
  for (const match of markdown.matchAll(/\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+['"][^'"]*['"])?\s*\)/g)) references.add(match[1] ?? match[2]);
  for (const match of markdown.matchAll(/^\s{0,3}\[(?:\\.|[^\]\\]){1,999}\]:\s*(?:<([^>]+)>|(\S+))/gm)) references.add(match[1] ?? match[2]);
  for (const match of markdown.matchAll(/\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) references.add(match[1] ?? match[2] ?? match[3]);
  for (const match of markdown.matchAll(/<([a-z][a-z\d+.-]*:[^<>\s]+)>/gi)) references.add(match[1]);
  for (const match of markdown.matchAll(/<([^<>\s@]+@[^<>\s@]+)>/g)) references.add(`mailto:${match[1]}`);
  // Plain and fenced URLs are public copy too, even when not rendered as links.
  for (const match of markdown.matchAll(/https?:\/\/[^\s<>"')\]]+/gi)) references.add(match[0]);

  for (const original of references) {
    let reference;
    try {
      reference = decodeReference(original);
      if (/^[a-z][a-z\d+.-]*:/i.test(reference) || reference.startsWith("//")) {
        validateExternal(reference);
        continue;
      }
    } catch {
      // Never echo an unsafe URL: it may contain a credential.
      fail("README.md: unsafe or unverified external destination / malformed reference");
      continue;
    }
    const decoded = decodeURIComponent(reference);
    if (/[\\\x00-\x1f\x7f]/.test(decoded) || /(?:^|\/)\.\.(?:\/|$)/.test(decoded)) {
      fail("README.md: unsafe local reference");
      continue;
    }
    const [targetPart, fragment] = decoded.split("#", 2);
    const target = targetPart ? path.resolve(root, targetPart) : markdownPath;
    if (!target.startsWith(`${root}${path.sep}`) && target !== markdownPath) {
      fail("README.md: local reference escapes repository");
      continue;
    }
    if (!fs.existsSync(target)) {
      fail("README.md: missing local target");
      continue;
    }
    const realTarget = fs.realpathSync(target);
    const realRoot = fs.realpathSync(root);
    if (!realTarget.startsWith(`${realRoot}${path.sep}`)) {
      fail("README.md: local reference resolves outside repository");
      continue;
    }
    if (fragment) {
      if (target !== markdownPath || !headings.has(fragment.toLowerCase())) fail("README.md: missing fragment");
    }
    if (path.extname(target).toLowerCase() === ".svg") validateXml(target);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log("Profile validation passed.");
