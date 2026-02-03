import request from 'supertest';
import {
  createTestServer,
  createTestUser,
  createTestToken,
} from '../testServer';
import models from '../../models';

describe('User Resolvers', () => {
  let app;
  let server;

  beforeAll(async () => {
    const testServer = await createTestServer();
    app = testServer.app;
    server = testServer.server;
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Query: me', () => {
    it('returns null when no user is authenticated', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              me {
                _id
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.me).toBeNull();
    });

    it('returns the authenticated user', async () => {
      const { user, token } = await createTestUser({
        email: 'me-test@example.com',
      });

      const response = await request(app)
        .post('/graphql')
        .set('x-token', token)
        .send({
          query: `
            query {
              me {
                _id
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.me).toBeTruthy();
      expect(response.body.data.me.email).toBe('me-test@example.com');
      expect(response.body.data.me._id).toBe(user._id.toString());
    });
  });

  describe('Query: users', () => {
    it('returns a list of all users', async () => {
      await createTestUser({ email: 'user1@example.com' });
      await createTestUser({ email: 'user2@example.com' });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              users {
                _id
                email
                createdAt
                updatedAt
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Query: user', () => {
    it('returns a user by ID', async () => {
      const { user } = await createTestUser({ email: 'find-me@example.com' });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query GetUser($_id: ID!) {
              user(_id: $_id) {
                _id
                email
              }
            }
          `,
          variables: { _id: user._id.toString() },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user).toBeTruthy();
      expect(response.body.data.user.email).toBe('find-me@example.com');
    });

    it('returns null for non-existent user', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query GetUser($_id: ID!) {
              user(_id: $_id) {
                _id
                email
              }
            }
          `,
          variables: { _id: '507f1f77bcf86cd799439011' },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user).toBeNull();
    });
  });

  describe('Mutation: signUp', () => {
    it('creates a new user and returns success', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation SignUp($email: String!, $password: String!) {
              signUp(email: $email, password: $password) {
                success
                user {
                  _id
                  email
                }
              }
            }
          `,
          variables: {
            email: 'newuser@example.com',
            password: 'SecurePass123!',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.signUp.success).toBe(true);
      expect(response.body.data.signUp.user.email).toBe('newuser@example.com');

      // Verify user was created in database
      const dbUser = await models.User.findOne({
        email: 'newuser@example.com',
      });
      expect(dbUser).toBeTruthy();
    });

    it('returns error for duplicate email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation SignUp($email: String!, $password: String!) {
              signUp(email: $email, password: $password) {
                success
                user {
                  email
                }
              }
            }
          `,
          variables: {
            email: 'duplicate@example.com',
            password: 'SecurePass123!',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('already exists');
    });

    it('returns error for invalid email format', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation SignUp($email: String!, $password: String!) {
              signUp(email: $email, password: $password) {
                success
              }
            }
          `,
          variables: {
            email: 'invalid-email',
            password: 'SecurePass123!',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
    });

    it('returns error for weak password', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation SignUp($email: String!, $password: String!) {
              signUp(email: $email, password: $password) {
                success
              }
            }
          `,
          variables: {
            email: 'weakpass@example.com',
            password: 'weak',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('Password');
    });
  });

  describe('Mutation: signIn', () => {
    it('authenticates user with correct credentials', async () => {
      // Create user directly in DB with known password
      await models.User.create({
        email: 'signin@example.com',
        password: 'SecurePass123!',
      });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation SignIn($login: String!, $password: String!) {
              signIn(login: $login, password: $password) {
                success
                user {
                  email
                }
              }
            }
          `,
          variables: {
            login: 'signin@example.com',
            password: 'SecurePass123!',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.signIn.success).toBe(true);
      expect(response.body.data.signIn.user.email).toBe('signin@example.com');
    });

    it('returns error for wrong password', async () => {
      await models.User.create({
        email: 'wrongpass@example.com',
        password: 'CorrectPass123!',
      });

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation SignIn($login: String!, $password: String!) {
              signIn(login: $login, password: $password) {
                success
              }
            }
          `,
          variables: {
            login: 'wrongpass@example.com',
            password: 'WrongPassword123!',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('invalid login');
    });

    it('returns error for non-existent user', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation SignIn($login: String!, $password: String!) {
              signIn(login: $login, password: $password) {
                success
              }
            }
          `,
          variables: {
            login: 'nonexistent@example.com',
            password: 'AnyPassword123!',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('invalid login');
    });
  });

  describe('Mutation: signOut', () => {
    it('returns true on sign out', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .post('/graphql')
        .set('x-token', token)
        .send({
          query: `
            mutation {
              signOut
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.signOut).toBe(true);
    });
  });
});
