/**
 * Builds the JSON-LD documents for a generated Homebase page.
 *
 * @param {object} site Homebase site configuration.
 * @param {boolean} shopPage Whether the current route is the configured shop.
 * @param {object[]} recentContent Normalized recent article records.
 * @param {object} socialStats Build-time social statistics.
 * @param {object[]} youtubeChannels Build-time YouTube video records.
 * @param {string} ogImage Resolved Open Graph image URL.
 * @returns {object[]} JSON-LD documents ready for serialization.
 */
function buildStructuredData(
  site,
  shopPage,
  recentContent,
  socialStats,
  youtubeChannels,
  ogImage
) {
  const canonical = trimTrailingSlash(site?.seo?.canonical || "");
  if (!canonical) return [];

  const websiteId = `${canonical}#website`;
  const personId = `${canonical}#person`;
  const profilePageId = `${canonical}#profile-page`;
  const graph = [
    buildWebsite(site, canonical, websiteId, personId),
  ];

  if (shopPage && site.shop?.enabled) {
    const shopUrl = `${canonical}/${site.shop.path}/`;
    const itemListId = `${shopUrl}#items`;
    const breadcrumbId = `${shopUrl}#breadcrumb`;

    graph.push(
      buildCollectionPage(
        site,
        shopUrl,
        websiteId,
        personId,
        itemListId,
        breadcrumbId,
        ogImage
      ),
      buildPerson(site, personId, ogImage, socialStats),
      buildShopItemList(site, shopUrl, itemListId, personId),
      buildBreadcrumb(site, canonical, shopUrl, breadcrumbId)
    );
  } else {
    const videos = selectVideos(site, youtubeChannels);
    const breadcrumbId = `${canonical}#breadcrumb`;
    const profilePage = buildProfilePage(
      site,
      canonical,
      websiteId,
      personId,
      profilePageId,
      breadcrumbId,
      ogImage,
      recentContent
    );

    profilePage.speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: [
        ".profile-bio",
        ...(site.integrations?.faq?.enabled
          ? [".integration-faq-answer"]
          : []),
      ],
    };

    graph.push(
      profilePage,
      buildPerson(site, personId, ogImage, socialStats),
      ...buildReviewEntities(
        site.integrations?.testimonials,
        canonical,
        personId
      )
    );

    const links = buildLinkItemList(site, canonical);
    if (links) graph.push(links);

    const faq = buildFaqPage(site, canonical, profilePageId);
    if (faq) graph.push(faq);

    graph.push(buildBreadcrumb(site, canonical, null, breadcrumbId));
    graph.push(
      ...videos
        .filter((video) => video?.youtube_id && video?.title)
        .map((video) =>
          buildVideo(video, canonical, personId, profilePageId)
        )
    );
  }

  return [{ "@context": "https://schema.org", "@graph": graph }];
}

/**
 * Flattens configured link sections into unique positioned links.
 *
 * @param {object[]} sections Configured link sections.
 * @returns {object[]} Positioned links, deduplicated by URL without query text.
 */
function flattenLinks(sections) {
  const result = [];
  const seen = new Set();

  for (const section of sections || []) {
    for (const link of section.links || []) {
      if (!link?.title || !link?.url) continue;

      const cleanUrl = link.url.split("?")[0].replace(/\/$/, "");
      if (seen.has(cleanUrl)) continue;

      seen.add(cleanUrl);
      result.push({
        position: result.length + 1,
        title: link.title,
        url: link.url,
      });
    }
  }

  return result;
}

/**
 * Flattens shop collections into positioned items.
 *
 * @param {object[]} collections Configured shop collections.
 * @returns {object[]} Positioned shop items with their collection identifiers.
 */
function flattenShopItems(collections) {
  const result = [];

  for (const collection of collections || []) {
    for (const item of collection.items || []) {
      if (!item?.title) continue;

      result.push({
        ...item,
        position: result.length + 1,
        collection_id: collection.id,
      });
    }
  }

  return result;
}

/**
 * Serializes JSON-LD safely for embedding inside an HTML script element.
 *
 * @param {object} value JSON-LD value to serialize.
 * @returns {string} Serialized JSON with HTML-significant characters escaped.
 */
function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function buildWebsite(site, canonical, websiteId, personId) {
  return compact({
    "@type": "WebSite",
    "@id": websiteId,
    url: canonical,
    name: site.seo.site_name || site.seo.title,
    description: site.seo.description,
    publisher: { "@id": personId },
    inLanguage: site.profile.language || site.seo.locale,
  });
}

function buildProfilePage(
  site,
  canonical,
  websiteId,
  personId,
  profilePageId,
  breadcrumbId,
  ogImage,
  recentContent
) {
  const page = compact({
    "@type": "ProfilePage",
    "@id": profilePageId,
    name: site.seo.title,
    url: canonical,
    description: site.seo.description,
    image: ogImage,
    thumbnailUrl: ogImage,
    significantLink: canonical,
    isPartOf: { "@id": websiteId },
    breadcrumb: { "@id": breadcrumbId },
    mainEntity: { "@id": personId },
    keywords: site.seo.keywords?.join(", "),
    dateCreated: site.seo.date_created,
    dateModified: site.seo.date_modified,
    inLanguage: site.profile.language || site.seo.locale,
  });

  const articles = (recentContent || []).map((article) =>
    compact({
      "@type": "Article",
      headline: article.headline,
      url: article.url,
      image: article.image || ogImage,
      datePublished: article.datePublished,
      author: { "@id": personId },
    })
  );

  if (articles.length) page.hasPart = articles;
  return page;
}

function buildCollectionPage(
  site,
  shopUrl,
  websiteId,
  personId,
  itemListId,
  breadcrumbId,
  ogImage
) {
  return compact({
    "@type": "CollectionPage",
    "@id": `${shopUrl}#page`,
    url: shopUrl,
    name: `${site.shop.title} — ${site.seo.title}`,
    description: site.shop.description,
    image: site.shop.og_image || ogImage,
    isPartOf: { "@id": websiteId },
    about: { "@id": personId },
    mainEntity: { "@id": itemListId },
    breadcrumb: { "@id": breadcrumbId },
    dateModified: site.shop.date_modified,
    inLanguage: site.profile.language || site.seo.locale,
  });
}

function buildPerson(site, personId, ogImage, socialStats) {
  const personConfig = site.seo.person || {};
  const person = compact({
    "@type": "Person",
    "@id": personId,
    name: site.profile.name,
    alternateName: site.profile.username,
    identifier: site.profile.username,
    description: site.profile.tagline || site.seo.description,
    image: site.profile.avatar || ogImage,
    url: site.seo.canonical,
  });

  const sameAs = (site.socials || []).map((social) =>
    String(social.url || "").split("?")[0]
  ).filter(Boolean);
  if (personConfig.wikidata_id) {
    sameAs.push(`https://www.wikidata.org/wiki/${personConfig.wikidata_id}`);
  }
  if (sameAs.length) person.sameAs = [...new Set(sameAs)];

  const roles = (personConfig.roles || []).filter((role) => role?.job_title);
  if (roles.length) {
    person.jobTitle = roles.map((role) => role.job_title);
    const organizations = roles
      .filter((role) => role.works_for)
      .map((role) =>
        compact({
          "@type": "Organization",
          name: role.works_for,
          url: role.works_for_url,
        })
      );
    if (organizations.length) person.worksFor = organizations;
  }

  const interactionStatistics = buildInteractionStatistics(
    personConfig.stats,
    socialStats
  );
  if (interactionStatistics.length) {
    person.interactionStatistic = interactionStatistics;
  }

  if (site.profile.topics?.length) {
    person.knowsAbout = site.profile.topics;
  }
  if (site.profile.location) {
    person.homeLocation = {
      "@type": "Place",
      name: site.profile.location,
    };
  }
  if (site.profile.language) person.knowsLanguage = site.profile.language;
  if (site.profile.creator_type) {
    person.hasOccupation = {
      "@type": "Occupation",
      name: site.profile.creator_type,
    };
  }
  if (personConfig.awards?.length) person.award = personConfig.awards;
  if (personConfig.credentials?.length) {
    person.hasCredential = personConfig.credentials.map((credential) =>
      compact({
        "@type": "EducationalOccupationalCredential",
        name: credential.name,
        url: credential.url,
        credentialCategory: credential.category,
      })
    );
  }
  if (site.profile.contact_url) {
    person.contactPoint = {
      "@type": "ContactPoint",
      contactType: "Work inquiries",
      url: site.profile.contact_url,
    };
  }

  return person;
}

function buildInteractionStatistics(manualStats, socialStats) {
  if (socialStats?.stats?.length) {
    return socialStats.stats.map((stat) => ({
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/FollowAction",
      interactionService: compact({
        "@type": "WebSite",
        name: stat.serviceName,
        url: stat.serviceUrl,
      }),
      userInteractionCount: stat.followersCount,
    }));
  }

  const result = [];
  if (manualStats?.followers) {
    result.push({
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/FollowAction",
      userInteractionCount: manualStats.followers,
    });
  }
  if (manualStats?.posts_written) {
    result.push({
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WriteAction",
      userInteractionCount: manualStats.posts_written,
    });
  }
  return result;
}

function buildReviewEntities(testimonials, canonical, personId) {
  if (!testimonials?.enabled || !testimonials.items?.length) return [];

  const reviews = testimonials.items
    .filter((testimonial) => testimonial?.quote)
    .map((testimonial, index) => {
      const rating = normalizeRating(testimonial.rating);
      const review = compact({
        "@type": "Review",
        "@id": `${canonical}#review-${index + 1}`,
        itemReviewed: { "@id": personId },
        author: testimonial.author
          ? { "@type": "Person", name: testimonial.author }
          : undefined,
        reviewBody: testimonial.quote,
      });

      if (rating !== null) {
        review.reviewRating = {
          "@type": "Rating",
          ratingValue: rating,
          bestRating: 5,
          worstRating: 1,
        };
      }

      return review;
    });

  if (!reviews.length) return [];

  const ratings = reviews
    .map((review) => review.reviewRating?.ratingValue)
    .filter((rating) => typeof rating === "number");

  const result = [...reviews];
  if (ratings.length) {
    const average =
      Math.round(
        (ratings.reduce((total, rating) => total + rating, 0) /
          ratings.length) *
          100
      ) / 100;

    result.push({
      "@type": "AggregateRating",
      "@id": `${canonical}#aggregate-rating`,
      itemReviewed: { "@id": personId },
      ratingValue: average,
      bestRating: 5,
      worstRating: 1,
      ratingCount: ratings.length,
      reviewCount: reviews.length,
    });
  }

  return result;
}

function buildLinkItemList(site, canonical) {
  const links = flattenLinks(site.sections);
  if (!links.length) return null;

  return {
    "@type": "ItemList",
    "@id": `${canonical}#links`,
    name: `${site.seo.title} — Links`,
    url: canonical,
    itemListElement: links.map((link) => ({
      "@type": "ListItem",
      position: link.position,
      name: link.title,
      url: link.url,
    })),
  };
}

function buildShopItemList(site, shopUrl, itemListId, personId) {
  return {
    "@type": "ItemList",
    "@id": itemListId,
    name: `${site.shop.title} — ${site.seo.title}`,
    url: shopUrl,
    itemListElement: flattenShopItems(site.shop.collections).map((item) => ({
      "@type": "ListItem",
      position: item.position,
      item: buildShopItem(
        item,
        site.shop.currency,
        personId,
        site.shop.show_prices !== false
      ),
    })),
  };
}

function buildShopItem(item, defaultCurrency, personId, showPrices) {
  const common = compact({
    "@id": item.url,
    name: item.title,
    description: item.description,
    image: item.image,
    url: item.url,
  });
  const offer = buildOffer(item, defaultCurrency, showPrices);

  if (item.type === "course") {
    return compact({
      ...common,
      "@type": "Course",
      provider: { "@id": personId },
      hasCourseInstance: offer
        ? {
            "@type": "CourseInstance",
            courseMode: "online",
            offers: offer,
          }
        : undefined,
    });
  }

  if (item.type === "service" || item.type === "consultation") {
    return compact({
      ...common,
      "@type": "Service",
      provider: { "@id": personId },
      offers: offer,
    });
  }

  if (item.type === "book") {
    return compact({
      ...common,
      "@type": "Book",
      author: { "@id": personId },
      offers: offer,
    });
  }

  return compact({
    ...common,
    "@type": "Product",
    offers: offer || {
      "@type": "Offer",
      url: item.url,
    },
  });
}

function buildOffer(item, defaultCurrency, showPrices) {
  if (typeof item.price !== "number") return null;

  return compact({
    "@type": "Offer",
    price: showPrices ? item.price : undefined,
    priceCurrency: showPrices
      ? item.currency || defaultCurrency
      : undefined,
    availability: item.availability,
    url: item.url,
  });
}

function buildFaqPage(site, canonical, profilePageId) {
  const faq = site.integrations?.faq;
  if (!faq?.enabled || !faq.items?.length) return null;

  return {
    "@type": "FAQPage",
    "@id": `${canonical}#faq`,
    isPartOf: { "@id": profilePageId },
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildBreadcrumb(site, canonical, shopUrl, breadcrumbId) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: canonical,
    },
  ];

  if (shopUrl) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: site.shop.title,
      item: shopUrl,
    });
  }

  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: items,
  };
}

function buildVideo(video, canonical, personId, profilePageId) {
  return compact({
    "@type": "VideoObject",
    "@id": `${canonical}#video-${video.youtube_id}`,
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`,
    contentUrl: `https://www.youtube.com/watch?v=${video.youtube_id}`,
    embedUrl: `https://www.youtube.com/embed/${video.youtube_id}`,
    uploadDate: video.upload_date || video.published,
    creator: { "@id": personId },
    isPartOf: { "@id": profilePageId },
  });
}

function selectVideos(site, youtubeChannels) {
  return youtubeChannels?.length
    ? youtubeChannels
    : site.featured_videos || [];
}

function normalizeRating(value) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 5
    ? value
    : null;
}

function compact(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  );
}

function trimTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}

module.exports = {
  buildStructuredData,
  flattenLinks,
  flattenShopItems,
  serializeJsonLd,
};
