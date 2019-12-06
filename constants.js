// Use .env for dev, but use process.env directly in production (eg, for Heroku)
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  
  const dotenvConfig = require("dotenv").config(); 
  
  if (dotenvConfig.error) {
    throw dotenvConfig.error;
  }
}

const constants = {
  port: process.env.PORT || 3000,
  sentryAPIbase: process.env.SENTRY_API_BASE || "https://sentry.io/api/0",
  sentryAPIToken: process.env.SENTRY_TOKEN,
  sentryAPISecret: process.env.SENTRY_API_SECRET,
  sentryDSN: process.env.SENTRY_DSN,
  sentryRelease: process.env.SENTRY_RELEASE,
  projectID: process.env.SENTRY_PROJECT_ID,
  orgSlug: process.env.SENTRY_ORG,
  integrationProjectID: process.env.SENTRY_INTEGRATION_PROJECT_ID
};

module.exports = {
  constants
};
