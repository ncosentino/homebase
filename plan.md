# Structured Metadata Correctness Plan

This plan delivers the structured-metadata correctness work as four ordered
pull requests. Each branch builds on the preceding branch and targets `main`.
Merge the pull requests in numerical order; later diffs shrink automatically
as earlier pull requests merge.

## Guiding principles

- Preserve valid, visible, accurate structured data.
- Correct inaccurate values and entity relationships instead of deleting
  semantics because one consumer does not expose a rich result.
- Document general Schema.org meaning separately from consumer-specific search
  features and experimental AI or agent interoperability.
- Keep generated URLs, visible content, canonical metadata, and structured data
  consistent.
- Use narrow local checks and GitHub-hosted CI for the full fixture matrix.

## PR 1 - Semantic contract and regression coverage

Branch: `feat/semantic-contract-tests`

Deliverables:

- Document the preservation-first structured-data contract.
- Add fixture-based Eleventy builds for profile, enriched profile, and shop
  configurations.
- Parse every emitted JSON-LD block as JSON.
- Assert the current entity types, canonical URLs, and optional schema paths.
- Add a hosted CI quality job and make deployment jobs depend on it.

Acceptance criteria:

- All fixture builds complete without external content APIs.
- Every emitted JSON-LD block parses.
- Profile, FAQ, video, testimonial, and shop paths are represented in tests.
- Existing production metadata behavior remains unchanged.

## PR 2 - Truthful dates and provenance

Branch: `fix/truthful-content-dates`

Deliverables:

- Separate build generation time from content publication and modification
  time.
- Stop using build time as a fallback video upload date.
- Emit sitemap `lastmod`, ProfilePage `dateModified`, and Open Graph update time
  only from accurate content metadata.
- Distinguish content modification time from file generation time in
  machine-readable exports.
- Preserve sitemap protocol fields while documenting consumer-specific support.

Acceptance criteria:

- Scheduled rebuilds do not change content modification dates by themselves.
- Unknown video upload dates are omitted rather than synthesized.
- Tests cover configured, source-provided, and missing dates.

## PR 3 - Page-aware semantic graph

Branch: `refactor/page-aware-schema-graph`

Deliverables:

- Move JSON-LD object construction into tested JavaScript helpers.
- Serialize complete objects with `JSON.stringify`.
- Preserve stable WebSite, ProfilePage, Person, FAQ, Speakable, video, review,
  item-list, and shop entities.
- Represent the shop route with its own CollectionPage and breadcrumb IDs.
- Link shop entities to the stable creator and website entities.
- Calculate aggregate ratings from visible rated testimonials.
- Omit AggregateRating when no numeric ratings exist.

Acceptance criteria:

- Root and shop pages have canonical-matching primary page entities.
- Stable creator identity is shared across page graphs.
- Reviews remain machine-readable without synthetic ratings.
- All fixture JSON-LD remains parseable and semantically connected.

## PR 4 - Consumer-aware documentation and functional fixes

Branch: `fix/metadata-docs-and-links`

Deliverables:

- Add a structured-data support matrix covering semantic purpose, visible
  source, Google support, other consumers, and experimental interoperability.
- Preserve FAQPage, Speakable, Course, Book, reviews, Wikidata, and `llms.txt`
  while qualifying consumer-specific outcomes.
- Fix Mailchimp hosted forms so the AJAX newsletter runtime does not intercept
  them.
- Introduce one URL and UTM builder using `URL` and `URLSearchParams`.
- Reuse the URL builder across links, profile CTAs, portfolio cards, shop
  cards, rich-text links, and QR codes.

Acceptance criteria:

- Documentation makes no unsupported rich-result guarantees.
- Valid structured metadata remains available.
- Mailchimp hosted forms retain native submission behavior.
- Existing queries, fragments, spaces, ampersands, and Unicode survive UTM
  augmentation correctly.

## Validation and rollout

Every pull request must pass:

- `npm test`
- `npm run build`
- `mkdocs build --strict --quiet`
- GitHub-hosted generated-output fixture checks
- Pull-request preview deployment where repository secrets permit it

After all four pull requests merge:

- Rebuild and deploy the live site.
- Inspect root and shop pages in Schema.org Validator.
- Inspect supported features in Google Rich Results Test.
- Inspect live markup through Bing Webmaster URL Inspection.
- Re-measure crawl, search, and conversion behavior before planning additional
  content or schema expansion.

## Explicitly deferred

- Consent-management product design
- External-source caching and retry architecture
- Configurable AI search-versus-training crawler defaults
- New content archives or routes
- Multilingual routing
- Retargeting pixels, GTM, and A/B testing
