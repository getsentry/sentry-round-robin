const request = require("supertest");
const nock = require('nock');
const sendRequest = require('request-promise-native');
const {sentryAPIbase} = require('../constants');
const mockData = require('./mockdata.js');

describe("index.js", () => {
  let server;
  const app = require("../app");

  beforeAll( async () => {

    // Mock Sentry API responses
    nock(sentryAPIbase)
      .get(`/organizations/${mockData.orgSlug}/users/?project=${mockData.projectID}`)
      .reply(200, mockData.getUsersResponse);

    nock(sentryAPIbase)
     .put(`/issues/${mockData.issueID}/`, {'assignedTo': mockData.userNames[0]})
     .reply(200, mockData.assignIssueResponse);

    app.use(function(err, req, res, next) {
      console.error(err.stack); // Explicitly output any stack trace dumps to stderr
      next(err, req, res);
    });

    server = await app.listen(process.env.PORT);

  });

  afterAll(() => {
    server.close();
  });


  test("Upon receiving POST request from Sentry with new issue data, server sends reponse 200", done => {
    let response = request(server)
      .post("/")
      .set({ "Sentry-Hook-Resource": "issue" })
      .send(mockData.newIssueRequestBody)
      .expect(200);
    done();
  });

  test("First user is assigned to an issue and removed from queue", async function () {
    
    // Start with array of user #1 and user #2
    expect(app.queuedUsers.length).toBe(2);
    expect(app.queuedUsers[0]).toBe(mockData.userNames[0]);

    const requestOptions = {
      url: `http://127.0.0.1:${process.env.PORT}`,
      method: 'POST',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + process.env.SENTRY_TOKEN,
        'Sentry-Hook-Resource': 'issue'
      },
      body: mockData.newIssueRequestBody
    };

    try {
      let result = await sendRequest(requestOptions);
      // Expect user #1 to be removed, so user at index 0 is now user #2
      expect(app.queuedUsers.length).toBe(1);
      expect(app.queuedUsers[0]).toBe(mockData.userNames[1]);

    } catch (error) {
      console.log("Error retrieving project users: ", error.message);
    }

  });

});

