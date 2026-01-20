import '@babel/polyfill';
import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GraphQLError } from 'graphql';
import client from 'prom-client';

import mongoose from 'mongoose';

import schema from './schema';
import resolvers from './resolvers';
import models from './models';
import loaders from './loaders';

// Log AI routes registration
console.log('AI routes registered successfully');

// Server-Timing utility for tracking performance metrics
class ServerTiming {
  constructor() {
    this.timings = [];
    this.starts = new Map();
  }

  start(name) {
    this.starts.set(name, process.hrtime.bigint());
  }

  end(name, description = '') {
    const startTime = this.starts.get(name);
    if (startTime) {
      const duration = Number(process.hrtime.bigint() - startTime) / 1e6; // ms
      this.timings.push({ name, duration, description });
      this.starts.delete(name);
    }
  }

  async time(name, description, fn) {
    this.start(name);
    try {
      return await fn();
    } finally {
      this.end(name, description);
    }
  }

  getHeader() {
    return this.timings
      .map(t => {
        const desc = t.description ? `;desc="${t.description}"` : '';
        return `${t.name};dur=${t.duration.toFixed(2)}${desc}`;
      })
      .join(', ');
  }
}

// Apollo plugin for Server-Timing headers
const serverTimingPlugin = {
  async requestDidStart({ request, contextValue }) {
    const timing = new ServerTiming();
    const startTime = process.hrtime.bigint();

    return {
      async willSendResponse({ response }) {
        // Calculate total time at the end
        const totalDuration = Number(process.hrtime.bigint() - startTime) / 1e6;
        timing.timings.push({ name: 'total', duration: totalDuration, description: 'Total request time' });

        const header = timing.getHeader();
        if (header) {
          // Set header on Apollo's response object
          if (response.http?.headers) {
            response.http.headers.set('Server-Timing', header);
          }
        }
      },
      async executionDidStart() {
        timing.start('execution');
        return {
          async executionDidEnd() {
            timing.end('execution', 'GraphQL execution');
          },
          willResolveField({ info }) {
            const fieldName = `${info.parentType.name}.${info.fieldName}`;
            const start = process.hrtime.bigint();
            return () => {
              const duration = Number(process.hrtime.bigint() - start) / 1e6;
              // Only log slow fields (>10ms) to avoid noise
              if (duration > 10) {
                console.log(`[Slow Field] ${fieldName}: ${duration.toFixed(2)}ms`);
              }
            };
          },
        };
      },
    };
  },
};

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5],
  registers: [register]
});

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
        'http://localhost:3003'
      ]
    ),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  app.use(cors(corsOption));
  app.use(morgan('dev'));

  // Metrics middleware (before other routes)
  app.use((req, res, next) => {
    if (req.path === '/metrics' || req.path === '/health') return next();
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const duration = Number(process.hrtime.bigint() - start) / 1e9;
      const route = req.route?.path || req.path || 'unknown';
      const labels = { method: req.method, route, status: res.statusCode.toString() };
      httpRequestsTotal.inc(labels);
      httpRequestDuration.observe(labels, duration);
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Prometheus metrics endpoint
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
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
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      serverTimingPlugin,
    ],
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
      context: async ({ req, res }) => {
        const me = await getMe(req);
        const timing = new ServerTiming();

        // Set header on response finish
        res.on('finish', () => {
          const header = timing.getHeader();
          if (header && !res.headersSent) {
            res.setHeader('Server-Timing', header);
          }
        });

        return {
          models,
          me,
          secret: process.env.JWT_SECRET,
          timing, // Expose timing utility to resolvers
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

