// Use .env for dev, but use process.env directly in production (eg, for Heroku)
if (process.env.NODE_ENV !== "production") {
  const dotenvConfig = require("dotenv").config(); 
  
  if (dotenvConfig.error) {
    throw dotenvConfig.error;
  }
}

const port = process.env.PORT || 3000;
const sentryAPIbase = process.env.SENTRY_API_BASE || "https://sentry.io/api/0";
const sentryAPIToken = process.env.SENTRY_TOKEN;
const sentryAPISecret = process.env.SENTRY_API_SECRET;
const sentryDSN = process.env.SENTRY_DSN;
const projectID = process.env.SENTRY_PROJECT_ID;
const orgSlug = process.env.SENTRY_ORG;
const integrationProjectID = process.env.SENTRY_INTEGRATION_PROJECT_ID;

module.exports = {
  port,
  sentryAPIbase,
  sentryAPIToken,
  sentryAPISecret,
  sentryDSN,
  projectID,
  orgSlug,
  integrationProjectID
};
