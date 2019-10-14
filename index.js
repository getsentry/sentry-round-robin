const dotenvConfig = require('dotenv').config();

if (dotenvConfig.error) {
  throw dotenvConfig.error;
}

const app = require('./app')

// On server start, get list of users (from project listed in .env) and save to memory
const listener = app.listen(process.env.PORT, function() {
  // TODO: look up the right way to do this; listener undefined here:
  // console.log('Listening on port ' + listener.address().port);
  console.log('Listening on port ' + process.env.PORT);
});

module.exports = listener;

