import '@babel/polyfill';
import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import jwt from 'jsonwebtoken';
import { bodyParserGraphQL } from 'body-parser-graphql';
import DataLoader from 'dataloader';
import express from 'express';

import { ApolloServer,
  AuthenticationError,
} from 'apollo-server-express';

import mongoose from 'mongoose';

import schema from './schema';
import resolvers from './resolvers';
import models from './models';
import loaders from './loaders';

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true
});
mongoose.set('useCreateIndex', true);

const app = express();

const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};

app.use(bodyParserGraphQL());
app.use(cors(corsOption));
app.use(morgan('dev'));

const getMe = async req => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session has expired. Please sign in again.',
      );
    }
  }
};

const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs: schema,
  resolvers,
  formatError: error => {
    const message = error.message;

    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models))
        },
      }
    }

    if (req) {
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
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const httpServer = http.createServer(app);

const port = process.env.PORT || 8000;

httpServer.listen({ port: process.env.PORT || 8000 }, () => {
    console.log(`Apollo Server on http://localhost:${port}/graphql`);
});



