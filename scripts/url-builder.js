const TRACKING_KEYS = ["source", "medium", "campaign", "content", "term"];

/**
 * Adds merged UTM parameters to an HTTP(S), protocol-relative, or relative URL.
 *
 * Existing `utm_source` parameters make the operation idempotent. Fragment,
 * mail, telephone, JavaScript, and data URLs are returned unchanged.
 *
 * @param {string} value URL to augment.
 * @param {object} defaults Default tracking values.
 * @param {object} overrides Per-link tracking overrides.
 * @returns {string} URL with encoded tracking parameters.
 * @throws {TypeError} When an absolute or protocol-relative URL is malformed.
 */
function buildTrackedUrl(value, defaults = {}, overrides = {}) {
  if (!value) return value || "";

  const original = String(value);
  if (/^(#|mailto:|tel:|javascript:|data:)/i.test(original)) {
    return original;
  }

  const isProtocolRelative = original.startsWith("//");
  const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(original);
  const tracking = mergeTrackingParameters(defaults, overrides);
  if (!tracking.source) {
    return original;
  }

  if (!isAbsolute && !isProtocolRelative) {
    return buildRelativeTrackedUrl(original, tracking);
  }

  let url;
  try {
    url = new URL(isProtocolRelative ? `https:${original}` : original);
  } catch (cause) {
    throw new TypeError(
      `Cannot add tracking parameters to invalid URL "${original}".`,
      { cause }
    );
  }
  if (!["http:", "https:"].includes(url.protocol)) return original;
  if (url.searchParams.has("utm_source")) return original;

  for (const key of TRACKING_KEYS) {
    if (tracking[key] !== undefined && tracking[key] !== "") {
      url.searchParams.set(`utm_${key}`, String(tracking[key]));
    }
  }

  if (isAbsolute) return url.toString();
  return `//${url.host}${url.pathname}${url.search}${url.hash}`;
}

/**
 * Adds UTM parameters to href attributes in an HTML fragment.
 *
 * @param {string} content HTML fragment containing links.
 * @param {object} tracking Default UTM values.
 * @returns {string} HTML with eligible href values augmented.
 */
function addTrackingToHtml(content, tracking) {
  if (!content || !tracking?.source) return content || "";

  return String(content).replace(
    /href=(["'])([^"']+)\1/gi,
    (match, quote, url) => {
      const tracked = buildTrackedUrl(
        url.replace(/&amp;/gi, "&"),
        tracking
      ).replace(/&/g, "&amp;");
      return `href=${quote}${tracked}${quote}`;
    }
  );
}

function mergeTrackingParameters(defaults, overrides) {
  const result = {};

  for (const key of TRACKING_KEYS) {
    const override = overrides?.[key];
    result[key] =
      override !== undefined && override !== ""
        ? override
        : defaults?.[key];
  }

  return result;
}

function buildRelativeTrackedUrl(original, tracking) {
  const hashIndex = original.indexOf("#");
  const hash = hashIndex >= 0 ? original.slice(hashIndex) : "";
  const withoutHash =
    hashIndex >= 0 ? original.slice(0, hashIndex) : original;
  const queryIndex = withoutHash.indexOf("?");
  const path = queryIndex >= 0
    ? withoutHash.slice(0, queryIndex)
    : withoutHash;
  const query = queryIndex >= 0
    ? withoutHash.slice(queryIndex + 1)
    : "";
  const parameters = new URLSearchParams(query);

  if (parameters.has("utm_source")) return original;

  for (const key of TRACKING_KEYS) {
    if (tracking[key] !== undefined && tracking[key] !== "") {
      parameters.set(`utm_${key}`, String(tracking[key]));
    }
  }

  return `${path}?${parameters.toString()}${hash}`;
}

module.exports = {
  addTrackingToHtml,
  buildTrackedUrl,
};
