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
let queuedUsers = [];

// When receiving a POST request from Sentry:
app.post('/', async function(request, response) {

  console.log("appjs on post to /, : ", queuedUsers);
  const resource = request.get('sentry-hook-resource');
  const action = request.body.action;

  // If a new issue was just created
  if (resource === 'issue' && action === 'created') {

    // Init or reset queue if empty
    if (queuedUsers.length === 0) {
      queuedUsers = [...allUsers];
    }

    // Assign issue to the next user in the queue and remove user from queue
    const issueID = request.body.data.issue.id;
    console.log(request.body);
  console.log("issid: ", issueID);

    console.log("appjs queuedUsers RIGHT BEFORE assignIss: ", queuedUsers);
    let result = await assignIssue(issueID, queuedUsers.shift());
    console.log("appjs AFTER assignIssue");
  }

  response.send("Received: Issue created!");
});

async function init() {
  console.log("called init");
  // Get list of users for project, save to queue
  allUsers = await getProjectUsers(projectID, orgSlug, sentryAPIbase);
  queuedUsers = [...allUsers];  

  console.log("end init -- queuedUsers: ", queuedUsers);
  return queuedUsers;
}

app.listen = async function () {
  console.log("called listen");
  queuedUsers = await init();
  let server = http.createServer(this);
  console.log("end of listen");
  return server.listen.apply(server, arguments)
}

module.exports = app;

