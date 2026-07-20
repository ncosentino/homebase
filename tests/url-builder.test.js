const assert = require("node:assert/strict");
const test = require("node:test");
const {
  addTrackingToHtml,
  buildTrackedUrl,
} = require("../scripts/url-builder");

test("tracked URLs preserve existing queries and fragments", () => {
  const result = buildTrackedUrl(
    "https://example.com/page?existing=1#details",
    {
      source: "homebase",
      medium: "profile link",
      campaign: "summer & fall",
    }
  );
  const url = new URL(result);

  assert.equal(url.searchParams.get("existing"), "1");
  assert.equal(url.searchParams.get("utm_source"), "homebase");
  assert.equal(url.searchParams.get("utm_medium"), "profile link");
  assert.equal(url.searchParams.get("utm_campaign"), "summer & fall");
  assert.equal(url.hash, "#details");
});

test("per-link values override defaults and encode Unicode", () => {
  const result = buildTrackedUrl(
    "https://example.com/content",
    {
      source: "homebase",
      medium: "link",
      campaign: "default",
    },
    {
      campaign: "café launch",
      content: "hero & primary",
    }
  );
  const url = new URL(result);

  assert.equal(url.searchParams.get("utm_source"), "homebase");
  assert.equal(url.searchParams.get("utm_medium"), "link");
  assert.equal(url.searchParams.get("utm_campaign"), "café launch");
  assert.equal(url.searchParams.get("utm_content"), "hero & primary");
});

test("tracking is idempotent and skips non-navigation URLs", () => {
  const existing =
    "https://example.com/?utm_source=existing&utm_campaign=original#top";

  assert.equal(
    buildTrackedUrl(existing, { source: "homebase" }),
    existing
  );
  assert.equal(buildTrackedUrl("#section", { source: "homebase" }), "#section");
  assert.equal(
    buildTrackedUrl("mailto:test@example.com", { source: "homebase" }),
    "mailto:test@example.com"
  );
});

test("malformed absolute URLs fail with configuration context", () => {
  assert.throws(
    () => buildTrackedUrl("https://", { source: "homebase" }),
    /Cannot add tracking parameters to invalid URL "https:\/\/"/
  );
});

test("relative URLs retain their relative shape", () => {
  assert.equal(
    buildTrackedUrl("/shop/#course", { source: "homebase" }),
    "/shop/?utm_source=homebase#course"
  );
  assert.equal(
    buildTrackedUrl("shop/#course", { source: "homebase" }),
    "shop/?utm_source=homebase#course"
  );
  assert.equal(
    buildTrackedUrl("../shop/?existing=1#course", { source: "homebase" }),
    "../shop/?existing=1&utm_source=homebase#course"
  );
  assert.equal(
    buildTrackedUrl("?existing=1#course", { source: "homebase" }),
    "?existing=1&utm_source=homebase#course"
  );
});

test("HTML tracking reuses the same URL behavior", () => {
  const html =
    '<a href="https://example.com/page?existing=1&amp;other=2#details">Page</a>' +
    '<a href="mailto:test@example.com">Email</a>';
  const result = addTrackingToHtml(html, {
    source: "homebase",
    campaign: "summer sale",
  });

  assert.match(
    result,
    /href="https:\/\/example\.com\/page\?existing=1&amp;other=2&amp;utm_source=homebase&amp;utm_campaign=summer\+sale#details"/
  );
  assert.match(result, /href="mailto:test@example\.com"/);
});
