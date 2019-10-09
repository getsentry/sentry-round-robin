const request = require('supertest');

describe('index.js', () => {
  let server;
  beforeAll(() => {
    const app = require('./app')
    app.use(function (err, req, res, next) {
      console.error(err.stack); // Explicitly output any stack trace dumps to stderr
      next(err, req, res);
    });
    server = app.listen(process.env.PORT);
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
