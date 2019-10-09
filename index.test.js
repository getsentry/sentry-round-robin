const request = require('supertest');

describe('index.js', () => {
  let server;
  beforeAll(() => {
    server = require('./index');
    const {app, init} = require('./app')

    app.use(function (err, req, res, next) {
      console.error(err.stack); // Explicitly output any stack trace dumps to stderr
      next(err, req, res);
    });
    const listener = app.listen(process.env.PORT, async function() {
      init();
    });
  });

  afterAll(() => {
    server.close();
  });

  test('post / (webhook)', done => {
    request(server)
      .post('/')
      .expect(404, done);

  });  
});
