const mockData = require("./mockdata.js");
const { constants } = require("../constants.js");

// Before running Jest tests, use mock data for env variables to match mock APIs

constants.port = 8000;
constants.sentryDSN = mockData.sentryDSN;
constants.sentryToken = mockData.sentryToken;
constants.orgSlug = mockData.orgSlug;
constants.projectID = mockData.projectID;
