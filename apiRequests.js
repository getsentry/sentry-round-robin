const {sentryAPIbase, projectID, orgSlug} = require('./constants');
const sendRequest = require('request-promise-native');

// Return array of users for given project (or [])
async function getProjectUsers(projectID, orgSlug, sentryAPIbase) {
  const requestOptions = {
    url: `${sentryAPIbase}/organizations/${orgSlug}/users/?project=${projectID}`,
    json: true,
    headers: {'Authorization': 'Bearer ' + process.env.SENTRY_TOKEN}
  };

  try {
    let result = await sendRequest(requestOptions);
    return result.map(userData => userData.user.username);
  } catch (error) {
    console.log("Error retrieving project users: ", error.message);
    return [];
  }
}

// Assign issue to a given user
async function assignIssue(issueID, username) {
  const requestOptions = {
    url: `${sentryAPIbase}/issues/${issueID}/`,
    method: 'PUT',
    json: true,
    headers: {'Authorization': 'Bearer ' + process.env.SENTRY_TOKEN},
    body: {'assignedTo': username}
  };

  try {
    let result = await sendRequest(requestOptions);
    console.log(`Assigned issue ${issueID} to ${username}!`);
    return result;
  } catch (error) {
    console.log("Error assigning issue: ", error.message);
    return error.statusCode;
  }
}

module.exports = {
  getProjectUsers,
  assignIssue
};

