const assert = require("node:assert/strict");
const test = require("node:test");
const { buildFixture } = require("./helpers/build-fixture");

test("profile fixture emits parseable structured metadata", (t) => {
  const fixture = buildFixture("profile", () => {});
  t.after(() => fixture.cleanup());

  const html = fixture.read("_site/index.html");
  const documents = parseJsonLd(html);

  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/example\.com"\s*\/>/
  );
  assert.ok(findEntity(documents, "ProfilePage"));
  assert.ok(findEntity(documents, "Person"));
  assert.ok(findEntity(documents, "ItemList"));
});

test("enriched profile fixture covers optional semantic entities", (t) => {
  const fixture = buildFixture("enriched-profile", (site) => {
    site.featured_videos = [
      {
        youtube_id: "abc123",
        title: "Example Video",
        description: "An example video description.",
        upload_date: "2026-01-15",
      },
    ];
    site.integrations.faq = {
      enabled: true,
      position: "after_links",
      heading: "Frequently Asked Questions",
      items: [
        {
          question: "What does this creator publish?",
          answer: "Useful example content.",
        },
      ],
    };
    site.integrations.testimonials = {
      enabled: true,
      position: "after_links",
      heading: "Testimonials",
      items: [
        { quote: "Excellent work.", author: "Alex", rating: 5 },
        { quote: "Very useful.", author: "Jordan", rating: 4 },
      ],
    };
  });
  t.after(() => fixture.cleanup());

  const documents = parseJsonLd(fixture.read("_site/index.html"));
  const person = findEntity(documents, "Person");

  assert.ok(findEntity(documents, "FAQPage"));
  assert.ok(findEntity(documents, "WebPage"));
  assert.ok(findEntity(documents, "VideoObject"));
  assert.equal(person.review.length, 2);
  assert.equal(person.aggregateRating.ratingValue, "5");
});

test("shop fixture emits parseable metadata with a shop canonical", (t) => {
  const fixture = buildFixture("shop", (site) => {
    site.shop.enabled = true;
    site.shop.path = "shop";
  });
  t.after(() => fixture.cleanup());

  const html = fixture.read("_site/shop/index.html");
  const documents = parseJsonLd(html);

  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/example\.com\/shop\/"\s*\/>/
  );
  assert.ok(findEntity(documents, "ProfilePage"));
  assert.ok(findEntity(documents, "Person"));
  assert.ok(findEntity(documents, "ItemList"));
});

function parseJsonLd(html) {
  const documents = [];
  const pattern =
    /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    documents.push(JSON.parse(match[1]));
  }

  assert.ok(documents.length > 0, "expected at least one JSON-LD document");
  return documents;
}

function findEntity(documents, type) {
  for (const document of documents) {
    if (document["@type"] === type) {
      return document;
    }

    for (const entity of document["@graph"] || []) {
      if (entity["@type"] === type) {
        return entity;
      }
    }
  }

  return null;
}
