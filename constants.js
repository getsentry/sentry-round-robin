const sentryAPIbase = process.env.SENTRY_API_BASE || "https://sentry.io/api/0";
const projectID = process.env.SENTRY_PROJECT_ID;
const orgSlug = process.env.SENTRY_ORG;

module.exports = {
  sentryAPIbase,
  projectID,
  orgSlug
};
