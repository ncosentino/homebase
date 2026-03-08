const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

module.exports = async function () {
  const siteYaml = fs.readFileSync(
    path.join(__dirname, "site.yaml"),
    "utf8"
  );
  const site = yaml.load(siteYaml);
  const config = site.seo && site.seo.recent_content;

  if (!config) return [];

  const maxItems = config.max_items || 5;

  // Try RSS/Atom feed first
  if (config.rss_feed) {
    try {
      const res = await fetch(config.rss_feed);
      if (res.ok) {
        const xml = await res.text();
        const items = parseRss(xml, maxItems);
        if (items.length > 0) return items;
      } else {
        console.warn(`[recentContent] Failed to fetch RSS ${config.rss_feed}: ${res.status}`);
      }
    } catch (err) {
      console.warn(`[recentContent] Error fetching RSS: ${err.message}`);
    }
  }

  // Fall back to static list
  if (config.items && config.items.length) {
    return config.items.slice(0, maxItems).map((item) => ({
      headline: item.headline,
      url: item.url,
      datePublished: item.date_published || null,
    }));
  }

  return [];
};

function parseRss(xml, max) {
  const results = [];

  // RSS 2.0: <item>
  const rssPattern = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = rssPattern.exec(xml)) !== null && results.length < max) {
    const item = match[1];
    const title = extractTag(item, "title");
    const link = extractTag(item, "link") || extractAttr(item, "link", "href");
    const pubDate = extractTag(item, "pubDate") || extractTag(item, "dc:date");
    if (title && link) {
      results.push({
        headline: decodeEntities(title),
        url: link.trim(),
        datePublished: pubDate ? toIso(pubDate) : null,
      });
    }
  }
  if (results.length > 0) return results;

  // Atom: <entry>
  const atomPattern = /<entry>([\s\S]*?)<\/entry>/g;
  while ((match = atomPattern.exec(xml)) !== null && results.length < max) {
    const entry = match[1];
    const title = extractTag(entry, "title");
    const link = extractAttr(entry, "link", "href");
    const published = extractTag(entry, "published") || extractTag(entry, "updated");
    if (title && link) {
      results.push({
        headline: decodeEntities(title),
        url: link.trim(),
        datePublished: published ? toIso(published) : null,
      });
    }
  }

  return results;
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp("<" + tag + "[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/" + tag + ">", "i"));
  return m ? m[1].trim() : null;
}

function extractAttr(xml, tag, attr) {
  const m = xml.match(new RegExp("<" + tag + "[^>]*\\s" + attr + '="([^"]+)"', "i"));
  return m ? m[1] : null;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function toIso(dateStr) {
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return null;
  }
}
