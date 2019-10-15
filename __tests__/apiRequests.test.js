const nock = require('nock');

const {sentryAPIbase} = require('../constants');
const {getProjectUsers, assignIssue} = require('../apiRequests');
const mockData = require('./mockdata.js');

// Remove previous mock API endpoints after each test
afterEach(() => {
  nock.cleanAll()
});


describe('getProjectUsers ', () => {

  test('succeeds with an array of expected usernames', async () => {
    nock(sentryAPIbase)
      .get(`/organizations/${mockData.orgSlug}/users/?project=${mockData.projectID}`)
      .reply(200, mockData.getUsersResponse);

    const res = await getProjectUsers(mockData.projectID, mockData.orgSlug, sentryAPIbase)

    expect(res).toContain(mockData.userNames[0]);
    expect(res).toContain(mockData.userNames[1]);
    expect(res).toHaveLength(2);
  });


  test('fails with empty array', async () => {
    nock(sentryAPIbase)
      .get(`/organizations/${mockData.orgSlug}/users/?project=${mockData.projectID}`)
      .reply(404, {"detail":"The requested resource does not exist"});

    const res = await getProjectUsers(mockData.projectID, mockData.orgSlug, sentryAPIbase);
    expect(res).toHaveLength(0);
  });

});


describe('assignIssue ', () => {

  test('succeeds with status 200 and ...', async () => {
    nock(sentryAPIbase)
     .put(`/issues/${mockData.issueID}/`, {'assignedTo': mockData.userNames[0]})
     .reply(200, mockData.assignIssueResponse(mockData.userNames[0]));

    const res = await assignIssue(mockData.issueID, mockData.userNames[0])

    expect(res.id).toBe(mockData.issueID);
    expect(res.assignedTo.email).toBe(mockData.userNames[0]);
  });

  test(' where user doesnt exist fails with status code for no user', async () => {
    nock(sentryAPIbase)
     .put(`/issues/${mockData.issueID}/`, {'assignedTo': mockData.userNames[0]})
      .reply(mockData.noUserStatusCode, {"assignedTo":["Unknown actor input"]});

    const res = await assignIssue(mockData.issueID, mockData.userNames[0]);
    expect(res).toBe(mockData.noUserStatusCode);
  });
});

