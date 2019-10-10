const mockData = require('./mockdata.js');

// Before running Jest tests, use mock data for env variables to match mock APIs
process.env.PORT = 8000;
process.env.SENTRY_DSN = mockData.sentryDSN;
process.env.SENTRY_TOKEN = mockData.sentryToken;
process.env.SENTRY_ORG = mockData.orgSlug;
process.env.SENTRY_PROJECT_ID = mockData.projectID;

