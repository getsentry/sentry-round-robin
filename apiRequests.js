const { sentryAPIbase, sentryAPIToken, projectID, orgSlug } = require("./constants");
const sendRequest = require("request-promise-native");
const sentry = require("./sentry");

// Return array of users for given project (or [])
async function getProjectUsers(projectID, orgSlug) {
  const requestOptions = {
    url: `${sentryAPIbase}/organizations/${orgSlug}/users/?project=${projectID}`,
    json: true,
    headers: { Authorization: "Bearer " + sentryAPIToken }
  };

  let result = await sendRequest(requestOptions);
  return result.map(userData => userData.user.username);
}

// Assign issue to a given user
async function assignIssue(issueID, username) {
  const requestOptions = {
    url: `${sentryAPIbase}/issues/${issueID}/`,
    method: "PUT",
    json: true,
    headers: { Authorization: "Bearer " + sentryAPIToken },
    body: { assignedTo: username }
  };
  
  if (sentry) {
    sentry.addBreadcrumb({
      message: `Assigning issue. issueID: ${issueID}, username: ${username}`,
      level: sentry.Severity.Info
    });
  }

  return await sendRequest(requestOptions);
}

module.exports = {
  getProjectUsers,
  assignIssue
};
