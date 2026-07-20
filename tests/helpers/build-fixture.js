const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const yaml = require("js-yaml");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const runnerPath = path.join(__dirname, "run-eleventy.js");

function buildFixture(name, configure) {
  const fixtureRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), `homebase-${name}-`)
  );

  try {
    copyRepositoryInputs(fixtureRoot);

    const sitePath = path.join(fixtureRoot, "_data", "site.yaml");
    const site = yaml.load(fs.readFileSync(sitePath, "utf8"));
    normalizeFixture(site);
    configure(site);
    fs.writeFileSync(sitePath, yaml.dump(site, { lineWidth: 120 }), "utf8");

    execFileSync(process.execPath, [runnerPath, fixtureRoot], {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        GITHUB_TOKEN: "",
        GOOGLE_ANALYTICS_ID: "",
        NODE_PATH: [
          path.join(repositoryRoot, "node_modules"),
          process.env.NODE_PATH,
        ].filter(Boolean).join(path.delimiter),
        YOUTUBE_API_KEY: "",
      },
      stdio: "pipe",
    });

    return {
      read(relativePath) {
        return fs.readFileSync(path.join(fixtureRoot, relativePath), "utf8");
      },
      cleanup() {
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
      },
    };
  } catch (error) {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
    throw error;
  }
}

function copyRepositoryInputs(fixtureRoot) {
  for (const entry of [".eleventy.js", "_data", "scripts", "src"]) {
    fs.cpSync(
      path.join(repositoryRoot, entry),
      path.join(fixtureRoot, entry),
      { recursive: true }
    );
  }
}

function normalizeFixture(site) {
  site.font_url = "";
  site.featured_videos = [];
  site.sections = [
    {
      title: "Links",
      links: [
        {
          title: "Example",
          url: "https://example.com/content",
          icon: "globe",
        },
      ],
    },
  ];
  site.socials = [];

  site.profile.name = "Example Creator";
  site.profile.username = "@example";
  site.profile.bio = "Example creator profile.";
  site.profile.banner = "";
  site.profile.banner_webp = "";
  site.profile.banner_srcset = "";

  site.seo.title = "Example Creator";
  site.seo.description = "Example creator landing page.";
  site.seo.canonical = "https://example.com";
  site.seo.cname = "";
  site.seo.og_image = "https://example.com/og.png";
  site.seo.og_image_auto = false;
  site.seo.recent_content = { max_items: 0, items: [] };
  site.seo.person.stats.auto_fetch = false;

  site.favicon.mode = "none";
  site.embeds.youtube_channels = [];
  site.shop.enabled = false;

  for (const integration of Object.values(site.integrations || {})) {
    if (integration && typeof integration === "object") {
      integration.enabled = false;
    }
  }
}

module.exports = { buildFixture };
