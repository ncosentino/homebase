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

Homebase validates structured metadata at multiple levels:

1. Every generated JSON-LD block must parse as JSON.
2. Fixture builds cover profile, integration, video, review, and shop output.
3. Schema.org validation checks general vocabulary usage.
4. Consumer-specific tools check only the features that consumer documents.

Passing a consumer-specific validator is not a guarantee of presentation, and
failing to qualify for a presentation feature does not invalidate otherwise
accurate Schema.org metadata.
