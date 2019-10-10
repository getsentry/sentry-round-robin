const nock = require('nock');
const sendRequest = require('request-promise-native');
const {sentryAPIbase} = require('../constants');
const mockData = require('./mockdata.js');

describe("index.js", () => {
  let server;
  const app = require("../app");

  const newIssueRequestOptions = {
    url: `http://127.0.0.1:${process.env.PORT}`,
    method: 'POST',
    json: true,
    headers: {
      'Authorization': 'Bearer ' + process.env.SENTRY_TOKEN,
      'Sentry-Hook-Resource': 'issue'
    },
    body: mockData.newIssueRequestBody
  };

  beforeAll( async () => {

    // Mock Sentry API responses
    nock(sentryAPIbase)
      .persist() // Don't remove this interceptor when request received
      .get(`/organizations/${mockData.orgSlug}/users/?project=${mockData.projectID}`)
      .reply(200, mockData.getUsersResponse);

    nock(sentryAPIbase)
      .persist()
      .put(`/issues/${mockData.issueID}/`, {'assignedTo': mockData.userNames[0]})
      .reply(200, mockData.assignIssueResponse(mockData.userNames[0]));

    nock(sentryAPIbase)
      .persist()
      .put(`/issues/${mockData.issueID}/`, {'assignedTo': mockData.userNames[1]})
      .reply(200, mockData.assignIssueResponse(mockData.userNames[1]));

    app.use(function(err, req, res, next) {
      console.error(err.stack); // Explicitly output any stack trace dumps to stderr
      next(err, req, res);
    });

    server = await app.listen(process.env.PORT);

  });

  // Reset state of user queue
  afterEach( () => {
    app.allUsers = [...mockData.userNames];
    app.queuedUsers = [...mockData.userNames];
  });

  afterAll(() => {
    server.close();
  });


  test("Upon receiving POST request from Sentry with new issue data, server sends reponse 200", async function () {
    try {
      let result = await sendRequest(newIssueRequestOptions);
      expect(result).toBe('ok');
    } catch (error) {
      console.log("Error in test, sending POST to '/': ", error.message);
    }
  });

  test("First user is assigned to an issue and removed from queue", async function () {
    // Start with array of user #1 and user #2
    expect(app.queuedUsers.length).toBe(2);
    expect(app.queuedUsers[0]).toBe(mockData.userNames[0]);

    try {
      await sendRequest(newIssueRequestOptions);
      // Expect user #1 to be removed, so user at index 0 is now user #2
      expect(app.queuedUsers.length).toBe(1);
      expect(app.queuedUsers[0]).toBe(mockData.userNames[1]);

    } catch (error) {
      console.log("Error in test, sending POST to '/': ", error.message);
    }
  });

  test("When all users in queue are assigned an issue, queue is reset", async function () {
    try {
      // Assign both mock users to issues, removing them form users queue
      await sendRequest(newIssueRequestOptions);
      await sendRequest(newIssueRequestOptions);

      // Expect queue to be empty
      expect(app.queuedUsers.length).toBe(0);

      // Assign a third mock user, prompting queue to be reset
      await sendRequest(newIssueRequestOptions);
      
      // User #1 immediately assigned and removed from queue,
      // so user at index 0 is now user #2
      expect(app.queuedUsers.length).toBe(1);
      expect(app.queuedUsers[0]).toBe(mockData.userNames[1]);
    } catch (error) {
      console.log("Error in test, sending POST to '/': ", error.message);
    }
  });

  test.only("When a user no longer exists, reassign to subsequent users until successful, or repopulate the queue", async function () {
    // Override with mock user that doesn't exist in the mock API
    app.queuedUsers[0] = 'Mr. Nobody';

    try {
      // Assign both mock users to issues, removing them form users queue
      await sendRequest(newIssueRequestOptions);

      // Expect queue to be empty after removing nonexistent user #1
      // and then assigning/removing user #2
      expect(app.queuedUsers.length).toBe(0);
    } catch (error) {
      console.log("Error in test, sending POST to '/': ", error.message);
    }
  });

});

