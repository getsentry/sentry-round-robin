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
app.allUsers = [];

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
      app.queuedUsers = [...app.allUsers];
    }

    // Assign issue to the next user in the queue and remove user from queue
    const issueID = request.body.data.issue.id;
    let result = await assignIssue(issueID, app.queuedUsers.shift());

    // If result is unsuccessful (eg, user no longer exists),
    // attempt to reassign issue to each user until either
    // it succeeds or the queue is empty (in which case, repopulate it)
    if (result == null) { 
      await reassignIssue(issueID, app.queuedUsers[0]);
    }
  }

  response.status(200).send('ok');
});

// Get list of users for project, save to queue
async function init() {
  app.allUsers = await getProjectUsers(projectID, orgSlug, sentryAPIbase);
  app.queuedUsers = [...app.allUsers];
}

// Attempt to reassign an issue to each subsequent user in queue
// NOTE: relying on global vars here
async function reassignIssue (issueID, userName) {
  // If queue is NOT empty, attempt to reassign to next users
  while (app.queuedUsers && app.queuedUsers.length > 0) {
    let result = await assignIssue(app.queuedUsers.shift());
    if (result != null) {
      return result;
    }
    // If unsuccessful, continue looping
  }
  
  // If queue is empty, repopulate with updated users
  if (app.queuedUsers.length === 0) {
    console.log("Queue is empty; getProjectUsers again!");
    app.allUsers = await getProjectUsers(projectID, orgSlug, sentryAPIbase);
    app.queuedUsers = [...app.allUsers];

    if (app.queuedUsers != null && app.queuedUsers.length > 0) {
      let result = await assignIssue(app.queuedUsers.shift());
      if (result != null) {
        return result;
      }
    }
  }
  // If still unsuccessful after all that... give up? =P
  console.log("Unable to assign issue");
  return null;
}

async function repopulateUserQueue (projectID, orgSlug, sentryAPIbase) {
    let updatedUsers = await getProjectUsers(projectID, orgSlug, sentryAPIbase);
    app.allUsers = [...updatedUsers];
    app.queuedUsers = [...updatedUsers];

    if (updatedUsers != null && app.queuedUsers.length > 0) {
      let result = await assignIssue(app.queuedUsers.shift());
      if (result != null) {
        return result;
      }
    }
    // If still unsuccessful after repopulating users ... give up?
    return null;
}


app.listen = async function () {
  await init();
  let server = http.createServer(this);
  return server.listen.apply(server, arguments)
}

module.exports = app;

