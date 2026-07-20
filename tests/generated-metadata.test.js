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
  assert.ok(findEntity(documents, "WebSite"));
  assert.ok(findEntity(documents, "ProfilePage"));
  assert.ok(findEntity(documents, "Person"));
  assert.ok(findEntity(documents, "ItemList"));
  assert.equal(
    findEntity(documents, "ProfilePage").speakable["@type"],
    "SpeakableSpecification"
  );
  assert.equal(findEntity(documents, "ProfilePage").dateModified, undefined);
  assert.doesNotMatch(fixture.read("_site/sitemap.xml"), /<lastmod>/);
  assert.match(fixture.read("_site/llms.txt"), /- File generated: /);
  assert.doesNotMatch(
    fixture.read("_site/llms.txt"),
    /- Content last modified: /
  );
});

test("enriched profile fixture covers optional semantic entities", (t) => {
  const fixture = buildFixture("enriched-profile", (site) => {
    site.seo.date_modified = "2026-01-20T10:30:00.000Z";
    site.featured_videos = [
      {
        youtube_id: "abc123",
        title: "Example Video",
        description: "An example video description.",
        upload_date: "2026-01-15",
      },
      {
        youtube_id: "def456",
        title: "Undated Example Video",
        description: "A video without a known upload date.",
      },
    ];
    site.integrations.faq = {
      enabled: true,
      position: "after_links",
      heading: "Frequently Asked Questions",
      items: [
        {
          question: "What does this creator publish?",
          answer: "Useful </script> example content & guidance.",
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
        { quote: "Clear and practical.", author: "Casey" },
      ],
    };
  });
  t.after(() => fixture.cleanup());

  const documents = parseJsonLd(fixture.read("_site/index.html"));
  const person = findEntity(documents, "Person");
  const videos = findEntities(documents, "VideoObject");
  assert.ok(findEntity(documents, "FAQPage"));
  assert.equal(
    findEntity(documents, "ProfilePage").dateModified,
    "2026-01-20T10:30:00.000Z"
  );
  assert.equal(videos.length, 2);
  assert.equal(videos[0].uploadDate, "2026-01-15");
  assert.equal(videos[1].uploadDate, undefined);
  assert.equal(person.review.length, 3);
  assert.equal(person.review[2].reviewRating, undefined);
  assert.equal(person.aggregateRating.ratingValue, 4.5);
  assert.equal(person.aggregateRating.ratingCount, 2);
  assert.equal(person.aggregateRating.reviewCount, 3);
  assert.equal(
    findEntity(documents, "FAQPage").mainEntity[0].acceptedAnswer.text,
    "Useful </script> example content & guidance."
  );
  assert.match(
    fixture.read("_site/sitemap.xml"),
    /<lastmod>2026-01-20T10:30:00.000Z<\/lastmod>/
  );
  assert.match(
    fixture.read("_site/llms.txt"),
    /- Content last modified: 2026-01-20T10:30:00.000Z/
  );
});

test("shop fixture emits parseable metadata with a shop canonical", (t) => {
  const fixture = buildFixture("shop", (site) => {
    site.seo.date_modified = "2026-01-20T10:30:00.000Z";
    site.shop.enabled = true;
    site.shop.path = "shop";
    site.shop.date_modified = "2026-01-18T09:00:00.000Z";
    site.integrations.testimonials = {
      enabled: true,
      position: "after_links",
      heading: "Testimonials",
      items: [
        {
          quote: "Visible only on the profile.",
          author: "Alex",
          rating: 5,
        },
      ],
    };
  });
  t.after(() => fixture.cleanup());

  const html = fixture.read("_site/shop/index.html");
  const documents = parseJsonLd(html);

  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/example\.com\/shop\/"\s*\/>/
  );
  const collectionPage = findEntity(documents, "CollectionPage");

  assert.ok(findEntity(documents, "WebSite"));
  assert.ok(collectionPage);
  assert.ok(findEntity(documents, "Person"));
  assert.equal(findEntity(documents, "Person").review, undefined);
  assert.equal(findEntity(documents, "Person").aggregateRating, undefined);
  assert.ok(findEntity(documents, "ItemList"));
  assert.equal(collectionPage.url, "https://example.com/shop/");
  assert.equal(collectionPage.mainEntity["@id"], "https://example.com/shop/#items");
  assert.equal(
    collectionPage.breadcrumb["@id"],
    "https://example.com/shop/#breadcrumb"
  );
  assert.equal(findEntity(documents, "ProfilePage"), null);
  for (const type of ["Course", "Service", "Product", "Book"]) {
    assert.ok(
      findNestedEntities(documents, type).length > 0,
      `expected a ${type} shop entity`
    );
  }
  assert.equal(
    typeof findNestedEntities(documents, "Offer").find(
      (offer) => offer.price !== undefined
    ).price,
    "number"
  );
  assert.match(
    fixture.read("_site/sitemap.xml"),
    /<lastmod>2026-01-18T09:00:00.000Z<\/lastmod>/
  );
});

test("unrated testimonials remain reviews without an aggregate rating", (t) => {
  const fixture = buildFixture("unrated-testimonials", (site) => {
    site.integrations.testimonials = {
      enabled: true,
      position: "after_links",
      heading: "Testimonials",
      items: [
        { quote: "Thoughtful guidance.", author: "Alex" },
        { quote: "Strong communication.", author: "Jordan" },
        {
          quote: "Boolean ratings are not numeric.",
          author: "Casey",
          rating: true,
        },
      ],
    };
  });
  t.after(() => fixture.cleanup());

  const person = findEntity(
    parseJsonLd(fixture.read("_site/index.html")),
    "Person"
  );

  assert.equal(person.review.length, 3);
  assert.equal(person.aggregateRating, undefined);
  assert.equal(person.review[0].reviewRating, undefined);
  assert.equal(person.review[2].reviewRating, undefined);
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
  return findEntities(documents, type)[0] || null;
}

function findEntities(documents, type) {
  const entities = [];

  for (const document of documents) {
    if (document["@type"] === type) {
      entities.push(document);
    }

    for (const entity of document["@graph"] || []) {
      if (entity["@type"] === type) {
        entities.push(entity);
      }
    }
  }

  return entities;
}

function findNestedEntities(value, type, result = []) {
  if (Array.isArray(value)) {
    for (const entry of value) {
      findNestedEntities(entry, type, result);
    }
    return result;
  }

  if (!value || typeof value !== "object") {
    return result;
  }

  if (value["@type"] === type) {
    result.push(value);
  }

  for (const entry of Object.values(value)) {
    findNestedEntities(entry, type, result);
  }

  return result;
}
