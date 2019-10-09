const app = require('./app')

// On server start, get list of users (from project listed in .env) and save to memory
const listener = app.listen(process.env.PORT, function() {
  console.log('Listening on port ' + listener.address().port);
});

module.exports = listener;

