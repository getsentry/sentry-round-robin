# Sentry internal integration sample: Round robin issue assigment

![](https://travis-ci.org/getsentry/sentry-round-robin.svg?branch=master)

This is a sample internal integration for Sentry that assigns new issues to users, round-robin style -- based on the users attached to a project at the time you start the server, this app will cycle through the users, assigning each new issue to a different user until everyone has been assigned. After each cycle, the list of users is reset and repeats again in the same order.

Note: This first version currently works for only *one* project at a time. You'll need to copy the project ID into your `.env` to configure (see setup steps below).

## Setup

**Local setup:**
  
  1. Set up and run [ngrok](https://ngrok.com/). (Note: This of course works best with a stable ngrok URL! Otherwise, you'll need to update the Sentry integration's webhook each time you restart ngrok.)

  1. Clone this repository.

  1. Run `yarn install` or `npm install` to install the dependencies.

  1. In the folder for this repo, change the name of the `.env-sample` file to `.env`.

<br/>

**Create a new internal integration in your Sentry organization:**

  1. In the Sentry UI for your account, navigate to `Settings > Developer Settings > New Internal Integration`.

  1. Give the integration a title (for example, Round Robin Issue Assignment).

  1. Copy your ngrok URL into the "Webhook URL" field.

  1. Set the required permissions: "Issue & Event" requires `Read & Write`, and "Organization" requires `Read`.

  1. Check the box for "issue" under the "Webhooks" section to be notified when issued are created, resolved, or assigned.
  
  1. Press "Save Changes" on the bottom right

  1. From the bottom of the "Internal Integrations" page in the Sentry UI, under the "Tokens" section, copy the integration's token -- you'll need to paste this into your `.env` file next.

<br/>

**Set environment variables in the `.env` file:**

*Note: remember to change the name of the `.env-sample` file to `.env`.*

  - `SENTRY_TOKEN=yourtokenhere` -- Paste your integration's token (see previous step above).

  - `SENTRY_ORG` -- Copy your organization name from the Sentry UI under `Settings > General` under "Name".

  - `SENTRY_DSN` -- Copy the DSN for your chosen project from `Settings > Projects > Your Project > Client Keys (DSN)`.

  - `SENTRY_PROJECT_ID` -- You can get your project ID by going to `Projects` in the Sentry UI, clicking on your chosen project, and copying the ID from the end of the URL; for example, `sentry.io/organizations/yourorg/issues/?project=1234567`.

  - `PORT` -- Enter the port number for your local Node.js server (for example, `8000`).

<br/>

**Run it!**

  1. Make sure ngrok is running (and that it matches the webhook URL you entered for your internal integration in the Sentry UI).

  1. Run `yarn start` or `npm start` to start the server. Create a brand new issue in your chosen Sentry project to test it out; within a couple minutes, the issue should be assigned to one of that project's users!


## Running tests

This app uses Jest for tests. Run the tests via the console with `yarn test` or `npm run test`.

