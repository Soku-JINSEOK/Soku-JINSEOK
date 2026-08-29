#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] ?? ".");
const markdownPath = path.join(root, "README.md");
const errors = [];

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

  const references = [];
  for (const match of markdown.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+['"][^'"]*['"])?\)/g)) references.push(match[1]);
  for (const match of markdown.matchAll(/<(?:a|img)\b[^>]*(?:href|src)=["']([^"']+)["'][^>]*>/gi)) references.push(match[1]);

  for (const reference of references) {
    if (/^(?:https?:|mailto:|data:)/i.test(reference)) continue;
    const decoded = decodeURIComponent(reference);
    const [targetPart, fragment] = decoded.split("#", 2);
    const target = targetPart ? path.resolve(root, targetPart) : markdownPath;
    if (!target.startsWith(`${root}${path.sep}`) && target !== markdownPath) {
      fail(`README.md: local reference escapes repository: ${reference}`);
      continue;
    }
    if (!fs.existsSync(target)) {
      fail(`README.md: missing local target: ${reference}`);
      continue;
    }
    if (fragment) {
      if (target !== markdownPath || !headings.has(fragment.toLowerCase())) fail(`README.md: missing fragment: ${reference}`);
    }
    if (path.extname(target).toLowerCase() === ".svg") validateXml(target);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log("Profile validation passed.");
