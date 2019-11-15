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
app.nextUserIndex = 0;

// When receiving a POST request from Sentry:
app.post("/", async function(request, response) {
  if (!verifySignature(request, process.env.SENTRY_API_SECRET)) {
    return response.status(401).send('bad signature');
  }

  const resource = request.get("sentry-hook-resource");
  const action = request.body.action;

  // If a new issue was just created
  if (resource === "issue" && action === "created") {

    // Assign issue to the next user in the queue 
    const issueID = request.body.data.issue.id;
    await assignNextUser(issueID);
  }

  response.status(200).send("ok");
});

// Get list of users for project, save to queue
async function init() {
  let updatedUsers = await getProjectUsers(projectID, orgSlug);

  // If newly-retrieved list is still empty, give up!
  if (updatedUsers.length === 0) {
    throw new Error(`Unable to retrieve any users with access to project ${projectID}.`);
  }

  // Init queue and master list
  app.allUsers = [...updatedUsers];
}

async function assignNextUser(issueID) {
  while (app.allUsers && app.allUsers.length > 0) {
    let nextUser = app.allUsers[app.nextUserIndex];
    try { 
      let result = await assignIssue(issueID, nextUser);
      // Advance userIndex to next user (wrap around based on length of array)
      app.nextUserIndex = (++app.nextUserIndex) % app.allUsers.length;
      // Stop loop once successfully assigned
      return;
    } catch (error) {
      if (error.statusCode === 400) {
        // If the user is invalid, pull them out of the master list and continue loop
        removeUserFromList(app.nextUserIndex);
      } else {
        // For any other error code, peace out
        console.error("Can't assign issue. ");
        throw error;
      }
    }
  }

  throw new Error("Can't assign issue; no valid users remaining in master list. At this point, just go restart the server!");

}

function removeUserFromList(userIndex) {
  app.allUsers.splice(userIndex, 1)
}

app.listen = async function() {
  await init();
  let server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

module.exports = app;
