const request = require("supertest");
const nock = require('nock');
const {sentryAPIbase} = require('../constants');
const mockData = require('./mockdata.js');

describe("index.js", () => {
  let server;

  beforeAll( async () => {

    // Mock Sentry API responses
    nock(sentryAPIbase)
      .get(`/organizations/${mockData.orgSlug}/users/?project=${mockData.projectID}`)
      .reply(200, mockData.getUsersResponse);

    console.log("indextest mockissID ", mockData.issueID);
  console.log("indextest username: ", mockData.userNames[0]);

    nock(sentryAPIbase)
     .put(`/issues/${mockData.issueID}/`, {'assignedTo': mockData.userNames[0]})
     .reply(200, mockData.assignIssueResponse);

    const app = require("../app");

    app.use(function(err, req, res, next) {
      console.error(err.stack); // Explicitly output any stack trace dumps to stderr
      next(err, req, res);
    });

    console.log("INDEXtest, beforeAll, before app.listen");

    server = await app.listen(process.env.PORT, () => {console.log("listen done");});
    console.log("INDEXtest, beforeAll, AFTER app.listen");
  });

  afterAll(() => {
    server.close();
  });

  test("Upon receiving POST request from Sentry with new issue data, server sends reponse 200", done => {
    console.log(mockData.issueID);
    request(server)
      .post("/")
      .set({ "Sentry-Hook-Resource": "issue" })
      .send({ action: "created", data: { issue: { id: mockData.issueID} } })
      .expect(200, done);
  });

  /*
  test("First user is assigned to an issue and removed from queue", done => {
 
    // Hit '/' webhook
    // ...how to check queue?!?! it's stuck in app.js

    done();
  });
*/

});

