---
description: Homebase's preservation-first contract for accurate, visible, consumer-aware structured metadata.
---

# Structured Data Contract

Homebase treats structured metadata as a shared machine-readable description
of the visible site, not as markup for one search engine.

## Preservation rule

Valid structured information is preserved by default. A metadata field or
Schema.org entity is removed only when it is inaccurate, misleading, invalid,
or unrelated to visible page content.

The absence of a rich result in one search engine is not a reason to remove
otherwise accurate semantic information.

## Consumer dimensions

Every structured-data capability is evaluated independently across three
dimensions:

| Dimension | Question |
|-----------|----------|
| Semantic validity | Does the type and its data accurately describe visible content using the shared vocabulary? |
| Consumer support | Does a specific search engine or application document a feature based on the data? |
| Experimental interoperability | Could other crawlers, agents, or tools consume the data even without a documented presentation feature? |

Consumer-specific support can change without changing the underlying meaning
of the structured data.

## Accuracy requirements

Homebase metadata must:

- match the canonical URL and primary purpose of the page;
- describe content visible to visitors;
- use real publication and modification dates;
- omit unknown facts instead of manufacturing fallback values;
- distinguish `generatedAt` from `publishedAt` and `modifiedAt`;
- preserve stable entity identifiers across pages;
- connect related entities explicitly;
- serialize configurable text and URLs as valid JSON;
- distinguish site generation time from content modification time.

## Validation

Homebase automates structural validation:

1. Every generated JSON-LD block must parse as JSON.
2. Fixture builds cover profile, integration, video, review, and shop output.

Release verification uses external tools separately:

1. Schema.org Validator reviews general vocabulary and property relationships.
2. Consumer-specific tools check only the features that consumer documents.

Passing a consumer-specific validator is not a guarantee of presentation, and
failing to qualify for a presentation feature does not invalidate otherwise
accurate Schema.org metadata.

## Page graph model

Homebase emits one connected JSON-LD graph per generated HTML page:

- `WebSite` and `Person` use stable site-level identifiers.
- The home route uses `ProfilePage` as its primary page entity.
- The shop route uses a page-scoped `CollectionPage`.
- Page-specific item lists and breadcrumbs use identifiers based on their
  canonical route.
- Optional FAQ, video, review, and product entities reference the stable page
  and creator entities.

Complete objects are serialized in JavaScript rather than assembled as JSON
fragments in templates.

## Support matrix

Status last reviewed: **2026-07-19**.

| Entity or format | Visible source | Semantic purpose | Consumer-specific status | Experimental interoperability |
|------------------|----------------|------------------|--------------------------|-------------------------------|
| `WebSite` | Site title, description, language | Identifies the site and publisher | Google supports `WebSite` for site-name understanding; the Sitelinks Search Box was retired in 2024 | General site identity for Schema.org consumers |
| `ProfilePage` | Profile card and biography | Identifies the canonical creator profile page | Google documents `ProfilePage` primarily for creator profiles in community and discussion contexts; presentation is not guaranteed | Stable profile-page identity for graph consumers |
| `Person` | Name, biography, avatar, roles, socials | Describes the creator and connects identity signals | No single Google rich result is guaranteed | Core creator entity for search, agents, and linked-data tools |
| `CollectionPage` | Shop heading and collections | Identifies the shop route as a collection page | No dedicated Google rich result | Gives the shop a canonical page identity instead of reusing the profile page |
| `ItemList` | Visible links or shop cards | Describes ordered page items | Used as supporting structured data; presentation depends on context | Preserves ordering and item relationships |
| `Article` | Recent-content records | Describes externally published creator content | Article features generally require the article's own visible page and policies | Connects the profile to creator-authored content |
| `FAQPage` | Visible FAQ questions and answers | Expresses structured Q&A | Google removed FAQ rich results in May 2026 | Remains valid Q&A for other Schema.org-compatible consumers |
| `BreadcrumbList` | Visible route hierarchy | Describes navigation hierarchy | Google supports breadcrumbs when the hierarchy is meaningful | General route context |
| `SpeakableSpecification` | Profile bio and FAQ answers | Marks concise text-to-speech candidates | Google's implementation is a US English topical-news beta | Preserved for other or future speech consumers |
| `VideoObject` | Visible YouTube embeds | Describes video title, URLs, image, creator, and known upload date | Google video features focus on watch pages and require feature-specific fields | General video semantics even when a homepage is not an eligible watch page |
| `Review` | Visible testimonials | Describes attributed testimonial text and optional ratings with `itemReviewed` referencing the creator | Google review snippets do not support `Person` | Machine-readable creator reviews when truthful and visible |
| `AggregateRating` | Visible numeric testimonial ratings | Summarizes actual rated testimonials and identifies the creator through `itemReviewed` | No Google `Person` review-star eligibility | General aggregate semantics; omitted when no numeric ratings exist |
| `Course` | Visible course cards | Identifies educational offerings | Google phased out Course Info search presentation in 2025 | Course meaning remains valid beyond that presentation feature |
| `Book` | Visible book cards | Identifies books and their creator | Google announced the phase-out of Book Actions support in 2025 | Book semantics remain valid for other consumers |
| `Service` | Visible service or consultation cards | Identifies creator services and offers | No dedicated Google service rich result | Useful service semantics for other consumers and agents |
| `Product` + `Offer` | Visible product cards, URLs, and prices | Describes products and known offers | Google product features require visible, policy-compliant product information and may require additional fields | General commerce semantics for compatible consumers |
| `EducationalOccupationalCredential` | Visible or configured credentials | Describes creator credentials | No dedicated Google rich result | Identity and qualification context |
| `InteractionCounter` | Visible or fetched audience statistics | Describes follower and publishing counts | No guaranteed search presentation | Quantitative social-proof context |
| `llms.txt` / `llms-full.txt` | Profile, links, FAQ, products, and content summaries | Provides optional plain-text machine context | Google explicitly states that it ignores LLMS.txt for Search visibility | Emerging convention used by some documentation and developer tools |

## Interpretation rules

- Semantic validity does not imply a guaranteed search presentation.
- The absence or retirement of a presentation feature does not invalidate
  truthful Schema.org data.
- Search-engine requirements are checked independently from general
  Schema.org validity.
- Experimental interoperability is documented as a possibility, never as a
  ranking or citation guarantee.

## Primary references

- [Schema.org getting started](https://schema.org/docs/gs.html)
- [Google structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google FAQ removal notice](https://developers.google.com/search/updates#removing-faq-rich-result)
- [Google review snippet documentation](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Google Speakable documentation](https://developers.google.com/search/docs/appearance/structured-data/speakable)
- [Google VideoObject documentation](https://developers.google.com/search/docs/appearance/structured-data/video)
- [Google structured-data simplification](https://developers.google.com/search/blog/2025/06/simplifying-search-results)
- [Bing structured-data guidance](https://www.bing.com/webmasters/help/marking-up-your-site-with-structured-data-3a93e731)
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
- [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [llms.txt specification](https://llmstxt.org)
