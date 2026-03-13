/**
 * _data/qrCode.js
 * Generates a QR code SVG at build time for the qr_code integration widget.
 * Returns { svg, dataUri, url } or null if the widget is disabled or not configured.
 */

const fs   = require("fs");
const path = require("path");
const yaml = require("js-yaml");

async function buildQrSvg(url, opts = {}) {
  const QRCode = require("qrcode");
  const size = opts.size || 200;
  let svg = await QRCode.toString(url, {
    type: "svg",
    width: size,
    margin: opts.margin != null ? opts.margin : 1,
    errorCorrectionLevel: opts.errorCorrectionLevel || "M",
    color: {
      dark:  opts.color   || "#000000",
      light: opts.bgColor || "#00000000",
    },
  });
  if (opts.logo) {
    const logoSize   = opts.logoSize > 0 ? opts.logoSize : Math.round(size * 0.3);
    const logoOffset = Math.round((size - logoSize) / 2);
    svg = svg.replace(
      "</svg>",
      `<image href="${opts.logo}" x="${logoOffset}" y="${logoOffset}" ` +
      `width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/></svg>`
    );
  }
  return svg;
}

module.exports = async function () {
  const sitePath = path.join(__dirname, "site.yaml");
  const site     = yaml.load(fs.readFileSync(sitePath, "utf8"));
  const cfg      = site.integrations && site.integrations.qr_code;

  if (!cfg || !cfg.enabled) return null;

  // Resolve base URL
  const baseUrl = (cfg.url && cfg.url.trim()) || (site.seo && site.seo.canonical) || "";
  if (!baseUrl) return null;

  // Build UTM-appended URL
  const utm   = site.utm || {};
  const src   = (cfg.utm_source   && cfg.utm_source.trim())   || utm.source   || "";
  const med   = (cfg.utm_medium   && cfg.utm_medium.trim())   || "qr";
  const camp  = (cfg.utm_campaign && cfg.utm_campaign.trim()) || utm.campaign || "";
  let qrUrl   = baseUrl;
  if (src) {
    const sep = qrUrl.includes("?") ? "&" : "?";
    qrUrl += `${sep}utm_source=${encodeURIComponent(src)}&utm_medium=${encodeURIComponent(med)}`;
    if (camp) qrUrl += `&utm_campaign=${encodeURIComponent(camp)}`;
  }

  const opts = {
    size:                 cfg.size             || 200,
    color:                cfg.color            || "#000000",
    bgColor:              cfg.bg_color         || "#00000000",
    errorCorrectionLevel: cfg.error_correction || "M",
    margin:               cfg.margin != null ? cfg.margin : 1,
    logo:                 cfg.logo             || "",
    logoSize:             cfg.logo_size        || 0,
  };

  const svg     = await buildQrSvg(qrUrl, opts);
  const dataUri = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");

  return { svg, dataUri, url: qrUrl, baseUrl };
};
