// Fetches GitHub repo metadata (description, stars, language) at build time
// for all card-type sections in site.yaml. Keyed by "owner/repo" slug.
//
// No API key needed for public repos (60 req/hr unauthenticated).
// Set GITHUB_TOKEN secret in CI to raise the limit to 5000/hr.

const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

function extractGithubSlug(url) {
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
}

module.exports = async function () {
  const siteYamlPath = path.join(__dirname, "site.yaml");
  let site;
  try {
    site = yaml.load(fs.readFileSync(siteYamlPath, "utf8"));
  } catch {
    return {};
  }

  const slugs = new Set();
  for (const section of site.sections || []) {
    if (section.type !== "cards") continue;
    for (const link of section.links || []) {
      const slug = extractGithubSlug(link.github_url || link.url);
      if (slug) slugs.add(slug);
    }
  }

  if (!slugs.size) return {};

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    "User-Agent": "homebase-ssg",
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const result = {};
  await Promise.all(
    [...slugs].map(async (slug) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${slug}`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        result[slug] = {
          description: data.description || "",
          stars: data.stargazers_count || 0,
          language: data.language || "",
          topics: data.topics || [],
        };
      } catch {
        // silently skip — card renders with manually provided data
      }
    })
  );

  return result;
};
