const request = require("supertest");
const nock = require('nock');
const {sentryAPIbase} = require('../constants');
const mockData = require('./mockdata.js');

describe("index.js", () => {
  let server;

  beforeAll((done) => {

    // Mock requests
    nock(sentryAPIbase)
      .get(`/organizations/${mockData.orgSlug}/users/?project=${mockData.projectID}`)
      .reply(200, mockData.getUsersResponse);

    nock(sentryAPIbase)
     .put(`/issues/${mockData.issueID}/`, {'assignedTo': mockData.userNames[0]})
     .reply(200, mockData.assignIssueResponse);

    const app = require("../app");

    app.use(function(err, req, res, next) {
      console.error(err.stack); // Explicitly output any stack trace dumps to stderr
      next(err, req, res);
    });

    server = app.listen(process.env.PORT, done);
  });

  afterAll(() => {
    server.close();
  });

  test("post / (webhook)", done => {
    request(server)
      .post("/")
      .set({ "Sentry-Hook-Resource": "issue" })
      .send({ action: "created", data: { issue: { id: "1337" } } })
      .expect(404, done);
  });

});

