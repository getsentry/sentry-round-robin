const dotenvConfig = require('dotenv').config();
if (dotenvConfig.error) {
  throw dotenvConfig.error;
}

const {sentryAPIbase, projectID, orgSlug} = require('./constants');
const {getProjectUsers, assignIssue} = require('./apiRequests');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Array of all usernames with access to the given project
let allUsers;
// Array of usernames queued up to be assigned to upcoming new issues
let queuedUsers;

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

  response.send("Received: Issue created!");
});

async function init() {
    // Get list of users for project, save to queue
    allUsers = await getProjectUsers(projectID, orgSlug, sentryAPIbase);
    queuedUsers = [...allUsers];  
}

module.exports = {
    app, init
};