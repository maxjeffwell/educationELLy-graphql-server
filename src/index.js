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
  await mongoose.connect(process.env.MONGODB_URI);

  const app = express();

  const corsOption = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  app.use(bodyParserGraphQL());
  app.use(cors(corsOption));
  app.use(morgan('dev'));

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
    introspection: process.env.NODE_ENV !== 'production',
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (formattedError, error) => {
      if (process.env.NODE_ENV === 'production') {
        console.error('GraphQL Error:', error);
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
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

