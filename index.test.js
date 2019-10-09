const request = require('supertest');

describe('index.js', () => {
  let server;
  beforeAll(() => {
    server = require('./index');
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
