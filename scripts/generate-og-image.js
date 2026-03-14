/**
 * generate-og-image.js
 * Build-time OG image generator. Composites a 1200×630 PNG for social sharing cards.
 * Triggered via Eleventy's eleventy.before event when seo.og_image_auto: true.
 *
 * Requires: @napi-rs/canvas (npm install --save-dev @napi-rs/canvas)
 */

"use strict";

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const OUT_PATH = path.join(__dirname, "..", "src", "assets", "og-image-auto.png");
const W = 1200;
const H = 630;

async function generateOgImage() {
  const siteYaml = fs.readFileSync(
    path.join(__dirname, "..", "_data", "site.yaml"),
    "utf8"
  );
  const site = yaml.load(siteYaml);

  if (!site.seo || !site.seo.og_image_auto) return;

  let createCanvas, loadImage;
  try {
    ({ createCanvas, loadImage } = require("@napi-rs/canvas"));
  } catch {
    console.warn("[og-image] @napi-rs/canvas not installed — skipping OG image generation.");
    return;
  }

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Background
  const bgColor = site.seo.og_image_brand_color || "#1E2330";
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // Subtle gradient overlay for depth
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "rgba(255,255,255,0.06)");
  gradient.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Avatar (circular, left side)
  const avatarUrl = site.profile.avatar;
  const avatarSize = 180;
  const avatarX = 80;
  const avatarY = (H - avatarSize) / 2;

  if (avatarUrl) {
    try {
      const avatarImg = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Thin white ring around avatar
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } catch (err) {
      console.warn("[og-image] Could not load avatar:", err.message);
    }
  }

  const textX = avatarX + avatarSize + 60;
  const maxTextWidth = W - textX - 60;

  // Name
  const name = site.profile.name || "";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 68px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(name, textX, H / 2 - 10, maxTextWidth);

  // Tagline / description
  const tagline = site.profile.tagline || site.seo.description || "";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "30px sans-serif";
  wrapText(ctx, tagline, textX, H / 2 + 45, maxTextWidth, 44);

  // Site URL at bottom-right
  const displayUrl = (site.seo.canonical || "").replace(/^https?:\/\//, "");
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "24px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(displayUrl, textX, H - 52, maxTextWidth);

  const buf = canvas.toBuffer("image/png");
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, buf);
  console.log(`[og-image] Generated ${W}×${H} → ${OUT_PATH}`);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, y, maxWidth);
      line = word + " ";
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, y, maxWidth);
}

module.exports = generateOgImage;
