const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: '12345',
};

// Register and Login Function for Testing
const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;
  const agent = request.agent(app);
  const user = await UserService.create({ ...mockUser, ...userProps });
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('top-secret users tests', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('creates a secret', async () => {
    const [agent] = await registerAndLogin();
    const resp = await agent
      .post('/api/v1/secrets')
      .send({ title: 'secret title', description: 'secret description' });
    expect(resp.body).toEqual({
      id: expect.any(String),
      title: 'secret title',
      description: 'secret description',
      created_at: expect.any(String),
    });
  });

  it('gets a list of secrets', async () => {
    const [agent] = await registerAndLogin();
    await agent
      .post('/api/v1/secrets')
      .send({ title: 'secret title', description: 'secret description' });
    const resp = await agent.get('/api/v1/secrets');
    expect(resp.status).toEqual(200);
    expect(resp.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "created_at": "2022-11-21T22:28:14.941Z",
          "description": "secret description",
          "id": "1",
          "title": "secret title",
        },
      ]
    `);
  });

  afterAll(() => {
    pool.end();
  });
});
