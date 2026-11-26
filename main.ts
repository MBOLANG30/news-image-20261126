// news-image-20261126 — "Sum up 26 November's world news in one image"
// Entry program: writes the entry image to /output/entry.png.
// The image itself (entry.png, in this repo's root) is an original
// newspaper-front-page collage built for this competition: six panels
// summing up Thursday 26 November 2026 — Ras Tanura / Hormuz, Gaza,
// Ukraine's refinery strikes, Pakistan's first astronaut, the 100th
// Macy's Thanksgiving Parade, and Mumbai's 26/11 remembrance — plus a
// footer strip with four more stories from the day. This program does
// no network access and no image processing: it copies the bundled
// bytes verbatim, so repeated runs always produce identical output.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1024 * 1024; // competition gate: at most 1 MiB
const MAX_DIMENSION = 1024; // competition gate: at most 1024 by 1024 px

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.argv[2] ?? process.env.OUTPUT_DIR ?? "/output";
const target = join(outDir, "entry.png");

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

// Read the bundled image and check it is a real PNG inside the size gate.
if (!existsSync(source)) {
  throw new Error(`bundled image not found: ${source}`);
}
const bytes = readFileSync(source);
if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error("entry.png is not a PNG file");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}

// Copy the bytes verbatim so every run writes identical output.
mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

// Verify the copy is byte-identical before reporting success.
const written = readFileSync(target);
if (!written.equals(bytes)) {
  throw new Error("verification failed: /output/entry.png differs from entry.png");
}
console.log(
  `wrote ${target}: ${width}x${height} PNG, ${bytes.length} bytes, sha256 ${sha256(bytes)}`,
);
