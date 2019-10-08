const nock = require('nock');

const {sentryAPIbase, projectID, orgSlug} = require('./constants');
const {getProjectUsers, assignIssue} = require('./apiRequests');


const testOrgSlug = 'testOrg';
const testProjectID = '123456';
const testIssueID = '987654';
const testUserNames = ['testEmail@test.com', 'otherTestEmail@test.com'];

// Remove previous mock API endpoints after each test
afterEach(() => {
  nock.cleanAll()
});


describe('getProjectUsers ', () => {

  test('succeeds with an array of expected usernames', () => {
    nock(sentryAPIbase)
      .get(`/organizations/${testOrgSlug}/users/?project=${testProjectID}`)
      .reply(200, mockGetUsersResponse);

    return getProjectUsers(testProjectID, testOrgSlug, sentryAPIbase)
      .then(res => {
        expect(res).toContain(testUserNames[0]);
        expect(res).toContain(testUserNames[1]);
        expect(res).toHaveLength(2);
      });
  });


  test('fails with empty array', () => {
    nock(sentryAPIbase)
      .get(`/organizations/${testOrgSlug}/users/?project=${testProjectID}`)
      .reply(404, {"detail":"The requested resource does not exist"});

    return getProjectUsers(testProjectID, testOrgSlug, sentryAPIbase)
      .then(res => {
        expect(res).toHaveLength(0);
      });
  });

});


describe('assignIssue ', () => {
  
  test('succeeds with status 200 and ...', () => {
    nock(sentryAPIbase)
     .put(`/issues/${testIssueID}/`, {'assignedTo': testUserNames[0]})
     .reply(200, mockAssignIssueResponse);

    return assignIssue(testIssueID, testUserNames[0]).then(res => {
        expect(res.id).toBe(testIssueID);
        expect(res.assignedTo.email).toBe(testUserNames[0]);
      });
  });

  test(' where user doesnt exist fails with null', () => {
    nock(sentryAPIbase)
     .put(`/issues/${testIssueID}/`, {'assignedTo': testUserNames[0]})
      .reply(404, {"assignedTo":["Unknown actor input"]});

    return assignIssue(testIssueID, testUserNames[0])
      .then(res => {
        expect(res).toBeNull();
      });
  });


});


// Mocked API response bodies:
const mockGetUsersResponse = [{"dateCreated":"2019-05-09T18:06:01.728Z","user":{"username":testUserNames[0],"lastLogin":"2019-09-16T02:56:06.806Z","isSuperuser":false,"isManaged":false,"lastActive":"2019-10-08T15:05:38.715Z","isStaff":false,"id":"433307","isActive":true,"has2fa":false,"name":"OtherTest McTestuser","avatarUrl":"https://secure.gravatar.com/avatar/1eb103c0e899f372a85eb0a44f0a0f42?s=32&d=mm","dateJoined":"2019-05-09T18:06:01.443Z","emails":[{"is_verified":true,"id":"468229","email":testUserNames[0]}],"avatar":{"avatarUuid":null,"avatarType":"letter_avatar"},"hasPasswordAuth":false,"email":testUserNames[0]},"roleName":"Organization Owner","expired":false,"id":"9376061","projects":["buggy-sentry-project"],"name":"OtherTest McTestuser","role":"owner","flags":{"sso:linked":false,"sso:invalid":false},"email":testUserNames[0],"pending":false},{"dateCreated":"2019-09-30T16:06:51.949Z","user":{"username":testUserNames[1],"lastLogin":"2019-09-30T16:08:10.517Z","isSuperuser":false,"isManaged":false,"lastActive":"2019-10-02T23:15:43.773Z","isStaff":false,"id":"518100","isActive":true,"has2fa":false,"name":"OtherTest McTestuser","avatarUrl":"https://secure.gravatar.com/avatar/7828bc81ef4bbd6d38d749803e1a02c6?s=32&d=mm","dateJoined":"2019-09-30T16:08:09.839Z","emails":[{"is_verified":true,"id":"562269","email":testUserNames[1]}],"avatar":{"avatarUuid":null,"avatarType":"letter_avatar"},"hasPasswordAuth":true,"email":testUserNames[1]},"roleName":"Member","expired":false,"id":"9496972","projects":["buggy-sentry-project"],"name":"OtherTest McTestuser","role":"member","flags":{"sso:linked":false,"sso:invalid":false},"email":testUserNames[1],"pending":false}];

const mockAssignIssueResponse = {
  platform: 'javascript',
  lastSeen: '2019-10-08T18:10:09.708Z',
  numComments: 0,
  userCount: 1,
  culprit: '?(script)',
  title: 'ReferenceError: gottaCatchEmAll is not defined',
  id: testIssueID,
  assignedTo: 
   { type: 'user',
     email: testUserNames[0],
     name: 'Test McTestuser',
     id: '433307' },
  logger: null,
  type: 'error',
  annotations: [],
  metadata: 
   { type: 'ReferenceError',
     value: 'gottaCatchEmAll is not defined',
     filename: '/script.js' },
  status: 'unresolved',
  subscriptionDetails: null,
  isPublic: false,
  hasSeen: false,
  shortId: 'BUGGY-SENTRY-PROJECT-1W',
  shareId: null,
  firstSeen: '2019-10-08T18:10:09.708Z',
  count: '1',
  permalink: null,
  level: 'error',
  isSubscribed: false,
  isBookmarked: false,
  project: 
   { platform: '',
     slug: 'buggy-sentry-project',
     id: '1456385',
     name: 'Quick Little Bug (JS, Glitch)' },
  statusDetails: {}
};

