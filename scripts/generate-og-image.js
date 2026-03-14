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

  const accent = site.seo.og_image_brand_color || "#4B8FDB";
  const bg = "#0D1117";

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow behind avatar area
  const glowX = 280;
  const glowGrad = ctx.createRadialGradient(glowX, H / 2, 0, glowX, H / 2, 320);
  glowGrad.addColorStop(0, hexAlpha(accent, 0.18));
  glowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  // Dot grid pattern (subtle texture)
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  const dot = 1.5;
  const gap = 32;
  for (let gy = gap; gy < H; gy += gap) {
    for (let gx = gap; gx < W; gx += gap) {
      ctx.beginPath();
      ctx.arc(gx, gy, dot, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Left accent stripe ────────────────────────────────────────────────────
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 7, H);

  // ── Top + bottom hairlines ────────────────────────────────────────────────
  ctx.fillStyle = hexAlpha(accent, 0.35);
  ctx.fillRect(0, 0, W, 2);
  ctx.fillRect(0, H - 2, W, 2);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const avatarR = 116;
  const avatarCX = 260;
  const avatarCY = H / 2 - 10;

  // Outer glow ring
  ctx.save();
  ctx.strokeStyle = hexAlpha(accent, 0.5);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR + 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Avatar image
  const avatarUrl = (site.profile.avatar || "").split("?")[0];
  if (avatarUrl) {
    try {
      const avatarImg = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg,
        avatarCX - avatarR, avatarCY - avatarR,
        avatarR * 2, avatarR * 2);
      ctx.restore();

      // Bright ring over avatar
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(avatarCX, avatarCY, avatarR + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } catch (err) {
      console.warn("[og-image] Could not load avatar:", err.message);
    }
  }

  // ── Vertical divider ──────────────────────────────────────────────────────
  const divX = 420;
  const linGrad = ctx.createLinearGradient(divX, 80, divX, H - 80);
  linGrad.addColorStop(0, "rgba(255,255,255,0)");
  linGrad.addColorStop(0.3, hexAlpha(accent, 0.4));
  linGrad.addColorStop(0.7, hexAlpha(accent, 0.4));
  linGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = linGrad;
  ctx.fillRect(divX, 0, 1, H);

  // ── Text block ────────────────────────────────────────────────────────────
  const textX = divX + 52;
  const maxW = W - textX - 52;

  // Name
  const name = site.profile.name || "";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(name, textX, 210, maxW);

  // Role pill (first role from seo.person.roles)
  const firstRole = site.seo && site.seo.person && site.seo.person.roles && site.seo.person.roles[0];
  if (firstRole) {
    const roleText = `${firstRole.job_title}  ·  ${firstRole.works_for}`;
    ctx.font = "bold 22px sans-serif";
    const pillMetrics = ctx.measureText(roleText);
    const pillW = pillMetrics.width + 36;
    const pillH = 40;
    const pillX = textX;
    const pillY = 232;

    // Pill background
    ctx.fillStyle = hexAlpha(accent, 0.22);
    roundRect(ctx, pillX, pillY, pillW, pillH, 20);
    ctx.fill();

    // Pill border
    ctx.strokeStyle = hexAlpha(accent, 0.6);
    ctx.lineWidth = 1.5;
    roundRect(ctx, pillX, pillY, pillW, pillH, 20);
    ctx.stroke();

    // Pill text
    ctx.fillStyle = accent;
    ctx.fillText(roleText, pillX + 18, pillY + 27, maxW - 36);
  }

  // Tagline
  const tagline = site.profile.tagline || site.seo.description || "";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = "32px sans-serif";
  wrapText(ctx, tagline, textX, 328, maxW, 46);

  // URL bar at bottom
  const displayUrl = ((site.seo.display_url || site.seo.canonical) || "").replace(/^https?:\/\//, "");
  ctx.fillStyle = hexAlpha(accent, 0.12);
  ctx.fillRect(0, H - 68, W, 68);
  ctx.fillStyle = accent;
  ctx.font = "bold 24px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("🔗  " + displayUrl, textX, H - 34, maxW);

  const buf = canvas.toBuffer("image/png");
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, buf);
  console.log(`[og-image] Generated ${W}×${H} → ${OUT_PATH}`);
}

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
