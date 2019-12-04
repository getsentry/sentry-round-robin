const { port } = require("./constants").constants;

const app = require("./app");
require('./sentry');

// On server start, get list of users (from project listed in .env) and save to memory
const listener = app.listen(port, function() {
  console.log("Listening on port " + port);
});

module.exports = listener;
