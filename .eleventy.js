const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  // Support YAML data files
  eleventyConfig.addDataExtension("yaml", (contents) =>
    yaml.load(contents)
  );

  // Pass through static assets and theme CSS
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/icons");
  eleventyConfig.addPassthroughCopy({ "src/themes": "themes" });
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // Inline SVG shortcode — reads an icon file and returns raw SVG
  eleventyConfig.addShortcode("icon", function (name) {
    const iconPath = path.join(__dirname, "src", "icons", `${name}.svg`);
    if (fs.existsSync(iconPath)) {
      return fs.readFileSync(iconPath, "utf8");
    }
    return "";
  });

  // githubSlug filter — extracts "owner/repo" slug from a GitHub URL, or null
  eleventyConfig.addFilter("githubSlug", function (url) {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname !== "github.com") return null;
      const parts = u.pathname.replace(/^\/|\/$/g, "").split("/");
      if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
      return `${parts[0]}/${parts[1]}`;
    } catch {
      return null;
    }
  });

  // compactNumber filter — formats large numbers as "1.2k" etc.
  eleventyConfig.addFilter("compactNumber", function (n) {
    if (!n || isNaN(n)) return n;
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  });

  // flatLinks filter — flattens sections[].links[] into a single array with 1-based positions.
  // Deduplicates by URL (first occurrence wins) to satisfy JSON-LD ItemList uniqueness requirement.
  // Used to build ItemList JSON-LD without nested loop namespace issues.
  eleventyConfig.addFilter("flatLinks", function (sections) {
    if (!sections) return [];
    const result = [];
    const seen = new Set();
    let pos = 0;
    for (const section of sections) {
      for (const link of (section.links || [])) {
        if (!link || !link.title || !link.url) continue;
        const cleanUrl = link.url.split("?")[0].replace(/\/$/, "");
        if (seen.has(cleanUrl)) continue;
        seen.add(cleanUrl);
        pos++;
        result.push({ position: pos, title: link.title, url: link.url });
      }
    }
    return result;
  });

  // jsonEscape filter — escapes a string for safe embedding inside a JSON string literal.
  // Does NOT add surrounding quotes.
  eleventyConfig.addFilter("jsonEscape", function (str) {
    if (str == null) return "";
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  });

  // addUTM filter — appends UTM params to every href in an HTML string.
  // Skips hrefs that already contain utm_source, and skips #anchors/mailto/tel.
  // Idempotent: safe to call on bio content that already has baked-in UTM params.
  eleventyConfig.addFilter("addUTM", function (content, utmConfig) {
    if (!content || !utmConfig || !utmConfig.source) return content || "";
    return String(content).replace(/href=(["'])([^"']+)\1/gi, function (match, q, url) {
      if (!url || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) return match;
      if (url.includes("utm_source=")) return match;
      const sep = url.includes("?") ? "&" : "?";
      let qs = "utm_source=" + utmConfig.source;
      if (utmConfig.medium)   qs += "&utm_medium="   + utmConfig.medium;
      if (utmConfig.campaign) qs += "&utm_campaign=" + utmConfig.campaign;
      if (utmConfig.content)  qs += "&utm_content="  + utmConfig.content;
      if (utmConfig.term)     qs += "&utm_term="     + utmConfig.term;
      return "href=" + q + url + sep + qs + q;
    });
  });

  // md filter — renders inline Markdown to HTML (supports [text](url), **bold**, _italic_,
  // and bare URL auto-linking). Used for FAQ answers and other user-facing text fields
  // that benefit from lightweight markup without full block-level Markdown processing.
  const markdownIt = require("markdown-it")({ html: false, linkify: false, typographer: false });
  eleventyConfig.addFilter("md", function (content) {
    if (!content) return "";
    return markdownIt.renderInline(String(content));
  });

  // shopItems filter — flattens shop.collections[].items[] into a single array with 1-based
  // positions and collection_id. Used to build ItemList JSON-LD on the shop page.
  eleventyConfig.addFilter("shopItems", function (collections) {
    if (!collections) return [];
    const result = [];
    let pos = 0;
    for (const col of collections) {
      for (const item of (col.items || [])) {
        if (!item || !item.title) continue;
        pos++;
        result.push({ ...item, position: pos, collection_id: col.id });
      }
    }
    return result;
  });

  // Inline file shortcode — for inlining CSS into <style> tags if desired
  eleventyConfig.addShortcode("inlineFile", function (filePath) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf8");
    }
    return "";
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "../_data",
    },
    templateFormats: ["njk", "html", "md", "txt", "xml"],
    htmlTemplateEngine: "njk",
  };
};
