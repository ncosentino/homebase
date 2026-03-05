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
