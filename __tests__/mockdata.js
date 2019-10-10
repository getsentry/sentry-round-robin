// Test env vars to point to fake org and project to match mocked API
const sentryDSN = 'https://test@sentry.io/12345';
const sentryToken = 'abc123';
const orgSlug = 'testOrg';
const projectID = '123456';

// Sample Sentry data for API requests
const issueID = '987654';
const userNames = ['testEmail@test.com', 'otherTestEmail@test.com'];

// Sentry API sample response for .get(`/organizations/${orgSlug}/users/?project=${projectID}`)
const getUsersResponse = [{"dateCreated":"2019-05-09T18:06:01.728Z","user":{"username":userNames[0],"lastLogin":"2019-09-16T02:56:06.806Z","isSuperuser":false,"isManaged":false,"lastActive":"2019-10-08T15:05:38.715Z","isStaff":false,"id":"433307","isActive":true,"has2fa":false,"name":"OtherTest McTestuser","avatarUrl":"https://secure.gravatar.com/avatar/1eb103c0e899f372a85eb0a44f0a0f42?s=32&d=mm","dateJoined":"2019-05-09T18:06:01.443Z","emails":[{"is_verified":true,"id":"468229","email":userNames[0]}],"avatar":{"avatarUuid":null,"avatarType":"letter_avatar"},"hasPasswordAuth":false,"email":userNames[0]},"roleName":"Organization Owner","expired":false,"id":"9376061","projects":["buggy-sentry-project"],"name":"OtherTest McTestuser","role":"owner","flags":{"sso:linked":false,"sso:invalid":false},"email":userNames[0],"pending":false},{"dateCreated":"2019-09-30T16:06:51.949Z","user":{"username":userNames[1],"lastLogin":"2019-09-30T16:08:10.517Z","isSuperuser":false,"isManaged":false,"lastActive":"2019-10-02T23:15:43.773Z","isStaff":false,"id":"518100","isActive":true,"has2fa":false,"name":"OtherTest McTestuser","avatarUrl":"https://secure.gravatar.com/avatar/7828bc81ef4bbd6d38d749803e1a02c6?s=32&d=mm","dateJoined":"2019-09-30T16:08:09.839Z","emails":[{"is_verified":true,"id":"562269","email":userNames[1]}],"avatar":{"avatarUuid":null,"avatarType":"letter_avatar"},"hasPasswordAuth":true,"email":userNames[1]},"roleName":"Member","expired":false,"id":"9496972","projects":["buggy-sentry-project"],"name":"OtherTest McTestuser","role":"member","flags":{"sso:linked":false,"sso:invalid":false},"email":userNames[1],"pending":false}];

// Sentry API sample response for .put(`/issues/${issueID}/`, {'assignedTo': userNames[0]})
const assignIssueResponse = {
  platform: 'javascript',
  lastSeen: '2019-10-08T18:10:09.708Z',
  numComments: 0,
  userCount: 1,
  culprit: '?(script)',
  title: 'ReferenceError: gottaCatchEmAll is not defined',
  id: issueID,
  assignedTo: 
   { type: 'user',
     email: userNames[0],
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
     id: projectID',
     name: 'Quick Little Bug (JS, Glitch)' },
  statusDetails: {}
};

module.exports = {
  sentryDSN,
  sentryToken,
  orgSlug,
  projectID,
  issueID,
  userNames,
  getUsersResponse,
  assignIssueResponse
};

