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
  // Used to build ItemList JSON-LD without nested loop namespace issues.
  eleventyConfig.addFilter("flatLinks", function (sections) {
    if (!sections) return [];
    const result = [];
    let pos = 0;
    for (const section of sections) {
      for (const link of (section.links || [])) {
        if (!link || !link.title || !link.url) continue;
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
