const { projectID, orgSlug, integrationProjectID } = require("./constants");
const { getProjectUsers, assignIssue } = require("./apiRequests");
const verifySignature = require("./verify");
const sentry = require("./sentry");

const http = require("http");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use(function onError(err, req, res, next) {
  res.sendStatus(500);
});

// Array of all usernames with access to the given project
app.allUsers = [];

// Array of usernames queued up to be assigned to upcoming new issues
app.queuedUsers = [];

const errorWrapper = fn => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch(err) {
      const errorId = sentry.captureException(err);

      res.statusCode = 500;
      res.set("Sentry-Hook-Error", errorId);
      res.set("Sentry-Hook-Project", integrationProjectID);

      res.send();
    }
  }
}

// When receiving a POST request from Sentry:
app.post("/", errorWrapper(async function post(request, response) {
  if (!verifySignature(request, process.env.SENTRY_API_SECRET)) {
    return response.status(401).send('bad signature');
  }

  const resource = request.get("sentry-hook-resource");
  const {action} = request.body;

  if (sentry) {
    sentry.addBreadcrumb({
      message: `Request received. resource: ${resource}, action: ${action}`,
      level: sentry.Severity.Info
    });
  }

  // If a new issue was just created
  if (resource === "issue" && action === "created") {
    // Init or reset queue if empty
    if (app.queuedUsers.length === 0) {
      app.queuedUsers = [...app.allUsers];
    }

    // Assign issue to the next user in the queue and remove user from queue
    const {id:issueID} = request.body.data.issue;
    await assignNextUser(issueID);

    if (sentry) {
      sentry.addBreadcrumb({
        message: `New issue created. issueID: ${issueID}`,
        level: sentry.Severity.Info
      });
    }
  }

  response.status(200).send("ok");
}));

// Get list of users for project, save to queue
async function init() {

  if (sentry) {
    sentry.addBreadcrumb({
      message: `Server initialized`,
      level: sentry.Severity.Info
    });
  }

  let updatedUsers = await getProjectUsers(projectID, orgSlug);

  if (sentry) {
      sentry.addBreadcrumb({
        message: `updatedUsers: ${updatedUsers}`,
       level: sentry.Severity.Info
     });
    }

  // If newly-retrieved list is still empty, give up!
  if (updatedUsers.length === 0) {
    throw new Error(`Unable to retrieve any users with access to project ${projectID}.`);
  }

  // Init queue and master list
  app.allUsers = [...updatedUsers];
  app.queuedUsers = [...updatedUsers];
}

async function assignNextUser(issueID) {
  while (app.allUsers && app.allUsers.length > 0) {
    // Reset queue if empty by copying from master list
    if (app.queuedUsers && app.queuedUsers.length === 0) {
      repopulateUserQueue();
    }
    const dequeuedUser = app.queuedUsers.shift();
    try { 
      let result = await assignIssue(issueID, dequeuedUser);
      // Stop loop once successfully assigned
      return;
    } catch (error) {
      if (error.statusCode === 400) {
        // If the user is invalid, pull them out of the master list and continue loop
        removeUserFromList(dequeuedUser);
      } else {
        // For any other error code, peace out
        console.error("Can't assign issue. ");
        throw error;
      }
    }
  }

  throw new Error("Can't assign issue; no valid users remaining in master list. At this point, just go restart the server!");

}

function removeUserFromList(targetUser) {
  app.allUsers = app.allUsers.filter(user => user !== targetUser);
}

function repopulateUserQueue() {
  // Reset queuedUsers with list of available users
  app.queuedUsers = [...app.allUsers];
}

app.listen = async function() {
  await init();
  let server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

module.exports = app;
