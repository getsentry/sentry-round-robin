const dotenvConfig = require('dotenv').config();
if (dotenvConfig.error) {
  throw dotenvConfig.error;
}

const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });

const express = require('express');
const app = express();

const listener = app.listen(process.env.PORT, function() {
  console.log('Listening on port ' + listener.address().port);

  try {
    gottaCatchEmAll();
  } catch (err) {
    // Set random fingerprint so Sentry creates a new issue for every event:
    Sentry.withScope(function(scope) {
      scope.setFingerprint([+new Date()]);
      Sentry.captureException(err);
    });
    console.log("Sent event to Sentry");
  }

});

