const { projectID, orgSlug } = require("./constants");
const { getProjectUsers, assignIssue } = require("./apiRequests");
const verifySignature = require("./verify");

const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Array of all usernames with access to the given project
app.allUsers = [];

// Array of usernames queued up to be assigned to upcoming new issues
app.queuedUsers = [];


// When receiving a POST request from Sentry:
app.post("/", async function(request, response) {
  if (!verifySignature(request, process.env.SENTRY_API_SECRET)) {
    return response.status(401).send('bad signature');
  }

  const resource = request.get("sentry-hook-resource");
  const action = request.body.action;

  // If a new issue was just created
  if (resource === "issue" && action === "created") {
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

    await assignNextUser(issueID);
  }

  response.status(200).send("ok");
});

// Get list of users for project, save to queue
async function init() {
  await repopulateUserQueue();
}

async function assignNextUser(issueID) {
  while (app.queuedUsers && app.queuedUsers.length > 0) {
    const userToUnqueue = app.queuedUsers.shift();
    let result = await assignIssue(issueID, userToUnqueue);
    if (result !== null && result === 400) {
      // If the user was rejected by the server, pull them out of the master list
      app.allUsers = app.allUsers.filter(user => user !== userToUnqueue);
    } else if (result !== null && result !== 200) {
      return;
    }
  }

  await repopulateUserQueue();
  // If repopulating user queue gave us some new users, try assigning again,
  // otherwise bail out.
  // WARNING: Can this recur infinitely?
  return app.queuedUsers ? assignNextUser(issueID) : null;
}

async function repopulateUserQueue() {
  // If no valid users are remaining in the queue, request updated user list
  if (app.allUsers.length === 0) {
    let updatedUsers = await getProjectUsers(projectID, orgSlug);
    app.allUsers = [...updatedUsers];

    // If newly-retrieved list is still empty, give up!
    if (app.allUsers.length === 0) {
      console.error(
        "Unable to retrieve any users with access to this issue."
      );
    }
  }

  // Reset queuedUsers with list of available users
  app.queuedUsers = [...app.allUsers];
}

app.listen = async function() {
  await init();
  let server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

module.exports = app;
