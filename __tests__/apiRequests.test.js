const nock = require('nock');

const {sentryAPIbase} = require('../constants');
const {getProjectUsers, assignIssue} = require('../apiRequests');
const mockData = require('./mockdata.js');

// Remove previous mock API endpoints after each test
afterEach(() => {
  nock.cleanAll()
});


describe('getProjectUsers ', () => {

  test('succeeds with an array of expected usernames', () => {
    nock(sentryAPIbase)
      .get(`/organizations/${mockData.orgSlug}/users/?project=${mockData.projectID}`)
      .reply(200, mockData.getUsersResponse);

    return getProjectUsers(mockData.projectID, mockData.orgSlug, sentryAPIbase)
      .then(res => {
        expect(res).toContain(mockData.userNames[0]);
        expect(res).toContain(mockData.userNames[1]);
        expect(res).toHaveLength(2);
      });
  });


  test('fails with empty array', () => {
    nock(sentryAPIbase)
      .get(`/organizations/${mockData.orgSlug}/users/?project=${mockData.projectID}`)
      .reply(404, {"detail":"The requested resource does not exist"});

    return getProjectUsers(mockData.projectID, mockData.orgSlug, sentryAPIbase)
      .then(res => {
        expect(res).toHaveLength(0);
      });
  });

});


describe('assignIssue ', () => {
  
  test('succeeds with status 200 and ...', () => {
    nock(sentryAPIbase)
     .put(`/issues/${mockData.issueID}/`, {'assignedTo': mockData.userNames[0]})
     .reply(200, mockData.assignIssueResponse);

    return assignIssue(mockData.issueID, mockData.userNames[0]).then(res => {
        expect(res.id).toBe(mockData.issueID);
        expect(res.assignedTo.email).toBe(mockData.userNames[0]);
      });
  });

  test(' where user doesnt exist fails with null', () => {
    nock(sentryAPIbase)
     .put(`/issues/${mockData.issueID}/`, {'assignedTo': mockData.userNames[0]})
      .reply(404, {"assignedTo":["Unknown actor input"]});

    return assignIssue(mockData.issueID, mockData.userNames[0])
      .then(res => {
        expect(res).toBeNull();
      });
  });


});

