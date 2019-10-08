const dotenvConfig = require('dotenv').config();
if (dotenvConfig.error) {
  throw dotenvConfig.error;
}

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const sendRequest = require('request-promise-native');

const sentryAPIbase = 'https://sentry.io/api/0';
const projectID = process.env.SENTRY_PROJECT_ID;
const orgSlug = process.env.SENTRY_ORG;

// Array of all usernames with access to the given project
let allUsers;
// Array of usernames queued up to be assigned to upcoming new issues
let queuedUsers;


// On server start, get list of users (from project listed in .env) and save to memory
const listener = app.listen(process.env.PORT, async function() {
  console.log('Listening on port ' + listener.address().port);
  
  // Get list of users for project, save to queue
  allUsers = await getProjectUsers(projectID, orgSlug, sentryAPIbase);
  queuedUsers = [...allUsers];
});


// When receiving a POST request from Sentry:
app.post('/', function(request, response) {
  
  const resource = request.get('sentry-hook-resource');
  const action = request.body.action;
  const issueID = request.body.data.issue.id;

  // If a new issue was just created
  if (resource === 'issue' && action === 'created') {

    // Reset queue if empty
    if (queuedUsers.length === 0) {
      queuedUsers = [...allUsers];
    }

    // Assign issue to the next user in the queue and remove user from queue
    assignIssue(issueID, queuedUsers.shift());
  }

  response.send("Recieved: Issue created!");
});


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
    console.log("Error retrieving project users: ", error);
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
  } catch (error) {
    console.log("Error assigning issue: ", error);
  }
}

