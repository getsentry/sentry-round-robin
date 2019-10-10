const dotenvConfig = require('dotenv').config();

if (dotenvConfig.error) {
  throw dotenvConfig.error;
}

const {sentryAPIbase, projectID, orgSlug} = require('./constants');
const {getProjectUsers, assignIssue} = require('./apiRequests');

const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Array of all usernames with access to the given project
let allUsers = [];

// Array of usernames queued up to be assigned to upcoming new issues
app.queuedUsers = [];

// When receiving a POST request from Sentry:
app.post('/', async function(request, response) {
  const resource = request.get('sentry-hook-resource');
  const action = request.body.action;

  // If a new issue was just created
  if (resource === 'issue' && action === 'created') {

    // Init or reset queue if empty
    if (app.queuedUsers.length === 0) {
      app.queuedUsers = [...allUsers];
    }

    // Assign issue to the next user in the queue and remove user from queue
    const issueID = request.body.data.issue.id;
    let result = await assignIssue(issueID, app.queuedUsers.shift());
  }

  response.status(200).end();
});

// Get list of users for project, save to queue
async function init() {
  allUsers = await getProjectUsers(projectID, orgSlug, sentryAPIbase);
  app.queuedUsers = [...allUsers];  
}

app.listen = async function () {
  await init();
  let server = http.createServer(this);
  return server.listen.apply(server, arguments)
}

module.exports = app;

