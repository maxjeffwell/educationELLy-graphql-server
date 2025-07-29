import '@babel/polyfill';
import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import jwt from 'jsonwebtoken';
import { bodyParserGraphQL } from 'body-parser-graphql';
import DataLoader from 'dataloader';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GraphQLError } from 'graphql';
import path from 'path';

import mongoose from 'mongoose';

import schema from './schema';
import resolvers from './resolvers';
import models from './models';
import loaders from './loaders';

async function startServer() {
  mongoose.Promise = global.Promise;

  // Use test database if TEST_DATABASE environment variable is set
  let mongoUri = process.env.MONGODB_URI;
  if (process.env.TEST_DATABASE) {
    mongoUri = `mongodb://localhost:27017/${process.env.TEST_DATABASE}`;
  }

  await mongoose.connect(mongoUri);

  const app = express();

  const corsOption = {
    origin: process.env.NODE_ENV === 'development' ? true : (
      process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'https://educationelly-server-graphql-5b9748151d5a.herokuapp.com'
      ]
    ),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  app.use(bodyParserGraphQL());
  app.use(cors(corsOption));
  app.use(morgan('dev'));

  // Health check endpoint for Heroku
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'EducationELLy GraphQL Server',
      graphql: '/graphql',
      health: '/health'
    });
  });

  const getMe = async req => {
    const token = req.headers['x-token'];

    if (token) {
      try {
        return await jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        throw new GraphQLError(
          'Your session has expired. Please sign in again.',
          {
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          }
        );
      }
    }
  };

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    introspection: true,
    playground: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (formattedError, error) => {
      console.error('GraphQL Error Details:', {
        message: error.message,
        originalMessage: error.originalError?.message,
        locations: error.locations,
        path: error.path,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        extensions: error.extensions
      });

      // Allow specific user-facing errors to pass through in production
      const userFacingErrors = [
        'Student not found',
        'Invalid student ID format',
        'Cannot delete student: This student has related records that must be deleted first',
        'You are not authenticated as a user',
        'Your session has expired. Please sign in again.'
      ];

      // Check both error.message and originalError.message
      const errorMessage = error.message || error.originalError?.message || '';
      
      console.log('Checking error message:', errorMessage);
      console.log('User facing errors:', userFacingErrors);
      console.log('Is user facing?', userFacingErrors.includes(errorMessage));
      console.log('NODE_ENV:', process.env.NODE_ENV);

      if (process.env.NODE_ENV === 'production') {
        if (userFacingErrors.includes(errorMessage)) {
          console.log('Allowing user-facing error through:', errorMessage);
          return formattedError;
        }
        console.log('Masking error as internal server error');
        return new GraphQLError('Internal server error', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        });
      }
      return formattedError;
    },
  });

  await server.start();

  app.use(
    '/graphql',
    cors(corsOption),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const me = await getMe(req);
        return {
          models,
          me,
          secret: process.env.JWT_SECRET,
          loaders: {
            user: new DataLoader(keys =>
              loaders.user.batchUsers(keys, models)),
            student: new DataLoader(keys =>
              loaders.student.batchStudents(keys, models)),
          },
        };
      },
    })
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'client', 'build', 'index.html'));
    });
  }

  const port = process.env.PORT || 8000;

  httpServer.listen({ port }, () => {
    console.log(`🚀 Apollo Server ready at http://localhost:${port}/graphql`);
    console.log(`📊 Health check available at http://localhost:${port}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: ${mongoUri ? 'Connected' : 'Not configured'}`);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

