// Exposes environment variables to 11ty templates.
// Secrets like GOOGLE_ANALYTICS_ID are set in CI (GitHub Actions secrets)
// and never committed to the repository.
module.exports = {
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID || "",
};
