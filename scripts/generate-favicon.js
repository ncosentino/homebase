// scripts/generate-favicon.js
// Generates favicon.png, favicon-32x32.png, favicon-16x16.png, and
// apple-touch-icon.png from one of three configurable modes:
//
//   mode: "avatar"   — resize the profile avatar (profile.avatar or seo.og_image)
//   mode: "url"      — download and resize a custom image URL (favicon.url)
//   mode: "initials" — render a branded circle with auto-derived initials
//   mode: "none"     — skip generation entirely
//
// Output files are written to src/assets/ which Eleventy passes through to _site/assets/.
"use strict";

const fs   = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const SITE_YAML = path.join(__dirname, "..", "_data", "site.yaml");
const OUT_DIR   = path.join(__dirname, "..", "src", "assets");

const SIZES = [
  { name: "favicon.png",          size: 512  },
  { name: "favicon-32x32.png",    size: 32   },
  { name: "favicon-16x16.png",    size: 16   },
  { name: "apple-touch-icon.png", size: 180  },
];

async function generateFavicon() {
  const site = yaml.load(fs.readFileSync(SITE_YAML, "utf8"));
  const cfg  = site.favicon || {};
  const mode = (cfg.mode || "none").toLowerCase();

  if (mode === "none" || mode === "off") {
    console.log("[favicon] mode=none — skipping generation");
    return;
  }

  console.log(`[favicon] mode=${mode} — generating favicons`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  if (mode === "url" || mode === "avatar") {
    await generateFromImage(site, cfg, mode);
  } else if (mode === "initials") {
    await generateFromInitials(site, cfg);
  } else {
    console.warn(`[favicon] Unknown mode "${mode}" — skipping. Valid modes: avatar, url, initials, none`);
  }
}

// ── mode: avatar / url ────────────────────────────────────────────────────────

async function generateFromImage(site, cfg, mode) {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.warn("[favicon] sharp not installed — cannot generate from image. Run: npm install sharp");
    return;
  }

  // avatar mode prefers profile.avatar, falls back to seo.og_image, then cfg.url
  const sourceUrl =
    mode === "avatar"
      ? (site.profile?.avatar || site.seo?.og_image || cfg.url)
      : cfg.url;

  if (!sourceUrl) {
    console.warn(`[favicon] mode=${mode} but no source URL found — set favicon.url or profile.avatar`);
    return;
  }

  console.log(`[favicon] Downloading source: ${sourceUrl}`);
  const buf = await fetchBuffer(sourceUrl);

  for (const { name, size } of SIZES) {
    const outPath = path.join(OUT_DIR, name);
    await sharp(buf)
      .resize(size, size, { fit: "cover", position: "centre" })
      .png()
      .toFile(outPath);
    console.log(`[favicon] Written ${size}×${size}: ${outPath}`);
  }
}

// ── mode: initials ────────────────────────────────────────────────────────────

async function generateFromInitials(site, cfg) {
  let createCanvas;
  try {
    ({ createCanvas } = require("canvas"));
  } catch {
    console.warn("[favicon] canvas not installed — cannot generate initials favicon. Run: npm install canvas");
    return;
  }

  const bgColor   = cfg.bg_color   || site.seo?.og_image_brand_color || "#4B8FDB";
  const textColor = cfg.text_color || "#FFFFFF";
  const initials  = cfg.initials   || deriveInitials(site);

  const SIZE = 512;
  const canvas = createCanvas(SIZE, SIZE);
  const ctx    = canvas.getContext("2d");

  // Filled circle background
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  // Centred initials
  const fontSize = initials.length > 2 ? 160 : 210;
  ctx.fillStyle    = textColor;
  ctx.font         = `bold ${fontSize}px sans-serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, SIZE / 2, SIZE / 2);

  const fullBuf = canvas.toBuffer("image/png");

  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    // No sharp — write 512×512 for all sizes as a degraded fallback
    console.warn("[favicon] sharp not installed — writing unresized icons (install sharp for proper multi-size output)");
    for (const { name } of SIZES) {
      const outPath = path.join(OUT_DIR, name);
      fs.writeFileSync(outPath, fullBuf);
      console.log(`[favicon] Written (unresized): ${outPath}`);
    }
    return;
  }

  for (const { name, size } of SIZES) {
    const outPath = path.join(OUT_DIR, name);
    await sharp(fullBuf).resize(size, size).png().toFile(outPath);
    console.log(`[favicon] Written ${size}×${size}: ${outPath}`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveInitials(site) {
  // 1. Explicit profile name → first letters of each word (max 2)
  const profileName = site.profile?.name;
  if (profileName) {
    return profileName
      .replace(/[^a-zA-Z\s]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join("");
  }
  // 2. First word of seo.title
  const title = (site.seo?.title || "").replace(/[^a-zA-Z\s]/g, "").trim();
  const first  = title.split(/\s+/)[0];
  return first ? first[0].toUpperCase() : "?";
}

async function fetchBuffer(url) {
  // Node 18+ built-in fetch
  if (typeof fetch !== "undefined") {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    return Buffer.from(await res.arrayBuffer());
  }
  // Older Node fallback with redirect support
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? require("https") : require("http");
    lib.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location));
      }
      if (res.statusCode >= 400) {
        return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end",  () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

module.exports = generateFavicon;
