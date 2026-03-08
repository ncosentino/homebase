const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

// Default service metadata keyed by icon name
const ICON_META = {
  youtube:      { name: "YouTube",       url: "https://www.youtube.com" },
  substack:     { name: "Substack",      url: "https://substack.com" },
  tiktok:       { name: "TikTok",        url: "https://www.tiktok.com" },
  linkedin:     { name: "LinkedIn",      url: "https://www.linkedin.com" },
  twitter:      { name: "Twitter",       url: "https://x.com" },
  instagram:    { name: "Instagram",     url: "https://www.instagram.com" },
  threads:      { name: "Threads",       url: "https://www.threads.com" },
  twitch:       { name: "Twitch",        url: "https://www.twitch.tv" },
  kick:         { name: "Kick",          url: "https://kick.com" },
  github:       { name: "GitHub",        url: "https://github.com" },
  bluesky:      { name: "Bluesky",       url: "https://bsky.app" },
  mastodon:     { name: "Mastodon",      url: null }, // instance URL from icon's own URL
  facebook:     { name: "Facebook",      url: "https://www.facebook.com" },
  pinterest:    { name: "Pinterest",     url: "https://www.pinterest.com" },
  applepodcast: { name: "Apple Podcasts",url: "https://podcasts.apple.com" },
};

module.exports = async function () {
  const siteYaml = fs.readFileSync(path.join(__dirname, "site.yaml"), "utf8");
  const site = yaml.load(siteYaml);

  const stats = site.seo && site.seo.person && site.seo.person.stats;
  if (!stats || !stats.auto_fetch) return { stats: [], totalReach: 0 };

  const manualResults = [];
  const apiCalls = [];

  // Step 1: icon-based stats
  for (const icon of site.social_icons || []) {
    if (!icon.icon) continue;
    const meta = ICON_META[icon.icon] || { name: icon.icon, url: null };
    const serviceName = icon.name || meta.name;
    const serviceUrl = meta.url || getOrigin(icon.url);

    if (typeof icon.followers === "number") {
      manualResults.push({ serviceName, serviceUrl, followersCount: icon.followers });
    } else {
      const call = buildAutoFetch(icon.url, serviceName, serviceUrl);
      if (call) apiCalls.push(call);
    }
  }

  // Step 2: youtube_channels — one InteractionCounter per channel
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  for (const channel of site.youtube_channels || []) {
    if (!channel.channel_id) continue;
    const serviceName = channel.name ? "YouTube (" + channel.name + ")" : "YouTube";
    const serviceUrl = "https://www.youtube.com/channel/" + channel.channel_id;

    if (youtubeApiKey) {
      apiCalls.push({
        type: "youtube",
        serviceName,
        serviceUrl,
        channelId: channel.channel_id,
        apiKey: youtubeApiKey,
        manualFallback: typeof channel.followers === "number" ? channel.followers : null,
      });
    } else if (typeof channel.followers === "number") {
      manualResults.push({ serviceName, serviceUrl, followersCount: channel.followers });
    }
  }

  // Run all API calls concurrently
  const apiResults = [];
  if (apiCalls.length > 0) {
    const settled = await Promise.allSettled(apiCalls.map(runApiCall));
    for (let i = 0; i < settled.length; i++) {
      const r = settled[i];
      const call = apiCalls[i];
      if (r.status === "fulfilled" && r.value != null) {
        apiResults.push(r.value);
      } else {
        if (r.status === "rejected") {
          console.warn("[socialStats] API call failed for " + call.serviceName + ": " + (r.reason && r.reason.message ? r.reason.message : r.reason));
        }
        // YouTube fallback to manual value when API key present but call failed
        if (call.type === "youtube" && call.manualFallback != null) {
          apiResults.push({ serviceName: call.serviceName, serviceUrl: call.serviceUrl, followersCount: call.manualFallback });
        }
      }
    }
  }

  const allStats = manualResults.concat(apiResults);
  const totalReach = allStats.reduce((sum, s) => sum + (s.followersCount || 0), 0);
  return { stats: allStats, totalReach };
};

function buildAutoFetch(url, serviceName, serviceUrl) {
  if (!url) return null;

  // GitHub: github.com/{user}
  const ghMatch = url.match(/github\.com\/([^/?#]+)/i);
  if (ghMatch) {
    return { type: "github", user: ghMatch[1], serviceName, serviceUrl };
  }

  // Bluesky: bsky.app/profile/{handle}
  const bskyMatch = url.match(/bsky\.app\/profile\/([^/?#]+)/i);
  if (bskyMatch) {
    return { type: "bluesky", handle: bskyMatch[1], serviceName, serviceUrl };
  }

  // Mastodon: {instance}/@{user}
  const mastoMatch = url.match(/https?:\/\/([^/]+)\/@([^/?#]+)/i);
  if (mastoMatch) {
    return { type: "mastodon", instance: mastoMatch[1], user: mastoMatch[2], serviceName, serviceUrl };
  }

  return null;
}

async function runApiCall(call) {
  if (call.type === "github") {
    const res = await fetch("https://api.github.com/users/" + call.user, {
      headers: { "User-Agent": "homebase-seo-build" },
    });
    if (!res.ok) throw new Error("GitHub API " + res.status);
    const data = await res.json();
    return { serviceName: call.serviceName, serviceUrl: call.serviceUrl, followersCount: data.followers };
  }

  if (call.type === "bluesky") {
    const res = await fetch("https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=" + encodeURIComponent(call.handle));
    if (!res.ok) throw new Error("Bluesky API " + res.status);
    const data = await res.json();
    return { serviceName: call.serviceName, serviceUrl: call.serviceUrl, followersCount: data.followersCount };
  }

  if (call.type === "mastodon") {
    const res = await fetch("https://" + call.instance + "/api/v1/accounts/lookup?acct=" + encodeURIComponent(call.user));
    if (!res.ok) throw new Error("Mastodon API " + res.status);
    const data = await res.json();
    return { serviceName: call.serviceName, serviceUrl: call.serviceUrl, followersCount: data.followers_count };
  }

  if (call.type === "youtube") {
    const res = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" + call.channelId + "&key=" + call.apiKey
    );
    if (!res.ok) throw new Error("YouTube API " + res.status);
    const data = await res.json();
    const item = data.items && data.items[0];
    if (!item) throw new Error("YouTube channel not found: " + call.channelId);
    return {
      serviceName: call.serviceName,
      serviceUrl: call.serviceUrl,
      followersCount: parseInt(item.statistics.subscriberCount, 10),
    };
  }

  throw new Error("Unknown API call type: " + call.type);
}

function getOrigin(url) {
  try {
    const u = new URL(url);
    return u.protocol + "//" + u.host;
  } catch {
    return url || "";
  }
}
