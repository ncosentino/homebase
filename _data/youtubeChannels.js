const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

module.exports = async function () {
  const siteYaml = fs.readFileSync(
    path.join(__dirname, "site.yaml"),
    "utf8"
  );
  const site = yaml.load(siteYaml);
  const channels = site.embeds && site.embeds.youtube_channels;

  if (!channels || !channels.length) return [];

  const results = [];

  for (const channel of channels) {
    const { channel_id, name, max_videos = 1 } = channel;
    if (!channel_id) continue;

    try {
      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel_id}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[youtubeChannels] Failed to fetch ${url}: ${res.status}`);
        continue;
      }
      const xml = await res.text();

      // Extract up to max_videos entries from Atom feed
      const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      let count = 0;

      while ((match = entryPattern.exec(xml)) !== null && count < max_videos) {
        const entry = match[1];
        const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
        const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);
        if (videoIdMatch && titleMatch) {
          results.push({
            youtube_id: videoIdMatch[1],
            title: titleMatch[1]
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'"),
            published: publishedMatch ? publishedMatch[1].split("T")[0] : null,
            description: descMatch ? descMatch[1].trim()
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .slice(0, 300) : null,
            _channel_name: name,
          });
          count++;
        }
      }
    } catch (err) {
      console.warn(`[youtubeChannels] Error fetching channel ${channel_id}: ${err.message}`);
    }
  }

  return results;
};
