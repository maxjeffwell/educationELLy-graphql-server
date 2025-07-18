import { expect } from 'chai';

import * as userApi from './api';

describe('users', () => {
  let validUserId;

  before(async () => {
    // Create initial test users
    await userApi.signUp({
      email: 'admin@educationelly.com',
      password: 'testpassword123',
    });

    await userApi.signUp({
      email: 'teacher1@school.edu', 
      password: 'testpassword123',
    });

    // Get admin token for authenticated tests  
    await userApi.signIn({
      login: 'admin@educationelly.com',
      password: 'testpassword123',
    });

    // Get a valid user ID from the created users
    const { data } = await userApi.users();
    if (data.data.users && data.data.users.length > 0) {
      validUserId = data.data.users[0]._id;
    }
  });

  describe('user(_id: ID!): User', () => {
    it('returns a user when user can be found', async () => {
      const result = await userApi.user({ _id: validUserId });

      expect(result.data.data.user).to.be.an('object');
      expect(result.data.data.user._id).to.equal(validUserId);
      expect(result.data.data.user).to.have.property('email');
      expect(result.data.data.user).to.have.property('createdAt');
      expect(result.data.data.user).to.have.property('updatedAt');
    });

    it('returns null when user cannot be found', async () => {
      const result = await userApi.user({ _id: '507f1f77bcf86cd799439011' });

      expect(result.data.data.user).to.be.null;
    });
  });

  describe('users: [User!]!', () => {
    it('returns a list of users', async () => {
      const result = await userApi.users();

      expect(result.data.data.users).to.be.an('array');
      expect(result.data.data.users.length).to.be.greaterThan(0);
      
      const firstUser = result.data.data.users[0];
      expect(firstUser).to.have.property('_id');
      expect(firstUser).to.have.property('email');
      expect(firstUser).to.have.property('createdAt');
      expect(firstUser).to.have.property('updatedAt');
    });
  });

  describe('me: User', () => {
    it('returns null when no user is signed in', async () => {
      const response = await userApi.me();
      
      // Check for GraphQL errors
      if (response.data.errors) {
        console.log('GraphQL errors:', response.data.errors);
      }

      expect(response.data).to.exist;
      expect(response.data.data).to.exist;
      expect(response.data.data.me).to.be.null;
    });

    it('returns me when me is signed in', async () => {
      const {
        data: {
          data: {
            signIn: { token },
          },
        },
      } = await userApi.signIn({
        login: 'admin@educationelly.com',
        password: 'testpassword123',
      });

      const { data } = await userApi.me(token);

      expect(data.data.me).to.be.an('object');
      expect(data.data.me).to.have.property('_id');
      expect(data.data.me).to.have.property('email');
      expect(data.data.me.email).to.equal('admin@educationelly.com');
      expect(data.data.me).to.have.property('createdAt');
      expect(data.data.me).to.have.property('updatedAt');
    });
  });

  describe('signUp', () => {
    it('signs up a new user successfully', async () => {
      const uniqueEmail = `user${Date.now()}@test.com`;
      const response = await userApi.signUp({
        email: uniqueEmail,
        password: 'testpassword123',
      });

      // Check for errors first
      if (response.data.errors) {
        console.log('SignUp errors:', response.data.errors);
      }

      expect(response).to.exist;
      expect(response.data).to.exist;
      
      if (!response.data.data) {
        console.log('Response data:', response.data);
      }
      
      expect(response.data.data).to.exist;
      expect(response.data.data.signUp).to.exist;
      expect(response.data.data.signUp.token).to.be.a('string');

      const token = response.data.data.signUp.token;

      const {
        data: {
          data: { me },
        },
      } = await userApi.me(token);

      expect(me).to.be.an('object');
      expect(me).to.have.property('_id');
      expect(me.email).to.equal(uniqueEmail);
      expect(me).to.have.property('createdAt');
      expect(me).to.have.property('updatedAt');
    });

    it('returns an error when signing up with existing email', async () => {
      const {
        data: { errors },
      } = await userApi.signUp({
        email: 'admin@educationelly.com',
        password: 'testpassword123',
      });

      expect(errors).to.be.an('array');
      expect(errors[0].message).to.include('E11000'); // MongoDB duplicate key error
    });
  });


  describe('signIn(login: String!, password: String!): Token!', () => {
    it('returns a token when a user signs in with email', async () => {
      const {
        data: {
          data: {
            signIn: { token },
          },
        },
      } = await userApi.signIn({
        login: 'admin@educationelly.com',
        password: 'testpassword123',
      });

      expect(token).to.be.a('string');
    });

    it('returns a token when a user signs in with teacher email', async () => {
      const {
        data: {
          data: {
            signIn: { token },
          },
        },
      } = await userApi.signIn({
        login: 'teacher1@school.edu',
        password: 'testpassword123',
      });

      expect(token).to.be.a('string');
    });

    it('returns an error when a user provides a wrong password', async () => {
      const {
        data: { errors },
      } = await userApi.signIn({
        login: 'admin@educationelly.com',
        password: 'wrongpassword',
      });

      expect(errors[0].message).to.include('You have entered invalid login credentials');
    });

    it('returns an error when a user is not found', async () => {
      const {
        data: { errors },
      } = await userApi.signIn({
        login: 'nonexistent@user.com',
        password: 'anypassword',
      });

      expect(errors[0].message).to.include('You have entered invalid login credentials');
    });
  });
});
