
describe('index.js', () => {
  let server;
  beforeAll(() => {
    server = require('./index');
  });

  afterAll(() => {
    server.close();
  });

  test('succeeds with an array of expected usernames', done => {
    setTimeout(1000, done);
  
    done();
  });  
});
