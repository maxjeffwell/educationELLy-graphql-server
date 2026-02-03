import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import cookieParser from 'cookie-parser';

import schema from '../schema';
import resolvers from '../resolvers';
import models from '../models';
import loaders from '../loaders';

// Test JWT secret
const TEST_JWT_SECRET = 'test-jwt-secret-for-testing-only';

// Cookie configuration for tests
const COOKIE_NAME = 'auth_token';
const getCookieOptions = () => ({
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});

// Create token for test users
export const createTestToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    TEST_JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Get user from token
const getMe = async (req) => {
  const token = req.cookies?.[COOKIE_NAME] || req.headers['x-token'];

  if (token) {
    try {
      return jwt.verify(token, TEST_JWT_SECRET);
    } catch {
      return null;
    }
  }
  return null;
};

// Create test server for supertest
export const createTestServer = async () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  // Build executable schema
  const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  });

  const server = new ApolloServer({
    schema: executableSchema,
    introspection: true,
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const me = await getMe(req);

        return {
          models,
          me,
          res,
          setAuthCookie: (token) => {
            res.cookie(COOKIE_NAME, token, getCookieOptions());
          },
          clearAuthCookie: () => {
            res.clearCookie(COOKIE_NAME, { path: '/' });
          },
          timing: {
            time: async (name, desc, fn) => fn(),
            start: () => {},
            end: () => {},
            getHeader: () => '',
          },
          loaders: {
            user: new DataLoader((keys) =>
              loaders.user.batchUsers(keys, models)
            ),
            student: new DataLoader((keys) =>
              loaders.student.batchStudents(keys, models)
            ),
          },
        };
      },
    })
  );

  // Return server for cleanup
  return { app, server };
};

// Helper to make GraphQL requests
export const graphqlRequest = (app) => {
  const request = require('supertest');

  return {
    query: (query, variables = {}, token = null) => {
      const req = request(app)
        .post('/graphql')
        .send({ query, variables });

      if (token) {
        req.set('x-token', token);
      }

      return req;
    },

    mutation: (mutation, variables = {}, token = null) => {
      const req = request(app)
        .post('/graphql')
        .send({ query: mutation, variables });

      if (token) {
        req.set('x-token', token);
      }

      return req;
    },
  };
};

// Test data factories
export const createTestUser = async (overrides = {}) => {
  const userData = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPass123!',
    ...overrides,
  };

  const user = await models.User.create(userData);
  const token = createTestToken(user);

  return { user, token };
};

export const createTestStudent = async (overrides = {}) => {
  const studentData = {
    fullName: `Test Student ${Date.now()}`,
    school: 'Test Elementary',
    teacher: 'Ms. Test',
    gradeLevel: '3',
    nativeLanguage: 'Spanish',
    ellStatus: 'Active ELL',
    compositeLevel: 'Intermediate',
    active: true,
    ...overrides,
  };

  const student = await models.Student.create(studentData);
  return student;
};
