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

    // If queue is currently empty, reset!
    if (app.queuedUsers.length === 0) {
      await repopulateUserQueue();
    }

    // Otherwise, remove this user from the queue and attempt to assign issue
    const userToUnqueue = app.queuedUsers.shift();
    let result = await assignIssue(issueID, userToUnqueue);

    // If result is a 400 error (no user / user doesn't have permission),
    if (result != null && result === 400) {
      // Also remove this user from allUsers queue
      app.allUsers = app.allUsers.filter( user => user !== userToUnqueue);

      // Attempt to reassign issue until queue is empty; if so, get users again
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
    let result = await assignIssue(issueID, app.queuedUsers.shift());

    if (result != null && result !== 400) {
      return result;
    }
    // If unsuccessful, continue looping
  }
  
  // If queue is empty, repopulate with updated users
  if (app.queuedUsers.length === 0) {
   
    try {
      await repopulateUserQueue();
      
      // Assign to next user if successfully repopulated list
      let result = await assignIssue(issueID, app.queuedUsers.shift());
      if (result != null && result !== 400) {
        return result;
      }
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  // If still unsuccessful after all that, give up!
  console.log("Unable to assign issue.");
  return null;
}

async function repopulateUserQueue () {
  // If no valid users are remaining in the queue, request updated user list
  if (app.allUsers.length === 0) {
    let updatedUsers = await getProjectUsers(projectID, orgSlug, sentryAPIbase);
    app.allUsers = [...updatedUsers];
  
    // If newly-retrieved list is still empty, give up!
    if (app.allUsers.length === 0) {
      throw new Error("Unable to retrieve any users with access to this issue.");    

    }
  }

  // Reset queuedUsers with list of available users
  app.queuedUsers = [...app.allUsers];
}

app.listen = async function () {
  await init();
  let server = http.createServer(this);
  return server.listen.apply(server, arguments)
}

module.exports = app;

