import '@babel/polyfill';
import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import http from 'http';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GraphQLError } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import {
  getComplexity,
  simpleEstimator,
  fieldExtensionsEstimator,
} from 'graphql-query-complexity';
import client from 'prom-client';

import mongoose from 'mongoose';

import schema from './schema';
import resolvers from './resolvers';
import models from './models';
import loaders from './loaders';

// Query complexity and depth limits configuration
const QUERY_DEPTH_LIMIT = 7; // Maximum nesting depth
const QUERY_COMPLEXITY_LIMIT = 1000; // Maximum complexity score

// Validation rules for GraphQL queries (depth limiting)
const getValidationRules = () => [
  // Prevent deeply nested queries (DoS protection)
  depthLimit(QUERY_DEPTH_LIMIT, {}, (depths) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Query depth:', Math.max(...Object.values(depths)));
    }
  }),
];

// Apollo plugin for query complexity analysis
const createQueryComplexityPlugin = (execSchema) => ({
  async requestDidStart() {
    return {
      async didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema: execSchema,
          query: document,
          variables: request.variables || {},
          estimators: [
            // Use field extensions if defined in schema
            fieldExtensionsEstimator(),
            // Fall back to simple estimator: each field = 1 point, lists multiplied
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('Query complexity:', complexity);
        }

        if (complexity > QUERY_COMPLEXITY_LIMIT) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed: ${QUERY_COMPLEXITY_LIMIT}`,
            {
              extensions: {
                code: 'QUERY_TOO_COMPLEX',
                complexity,
                maxComplexity: QUERY_COMPLEXITY_LIMIT,
              },
            }
          );
        }
      },
    };
  },
});

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

  // MongoDB connection pooling configuration
  // These settings prevent connection exhaustion under load
  const mongoOptions = {
    // Connection pool settings
    minPoolSize: parseInt(process.env.MONGODB_POOL_MIN_SIZE, 10) || 5,
    maxPoolSize: parseInt(process.env.MONGODB_POOL_MAX_SIZE, 10) || 50,
    // Timeout settings
    maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS, 10) || 30000,
    waitQueueTimeoutMS: parseInt(process.env.MONGODB_WAIT_QUEUE_TIMEOUT_MS, 10) || 5000,
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 10) || 5000,
    // Socket settings
    socketTimeoutMS: 45000,
    // Retry settings
    retryWrites: true,
    retryReads: true,
  };

  await mongoose.connect(mongoUri, mongoOptions);

  // Log connection pool info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('MongoDB connection pool configured:', {
      minPoolSize: mongoOptions.minPoolSize,
      maxPoolSize: mongoOptions.maxPoolSize,
    });
  }

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
  app.use(cookieParser());

  // Cookie configuration for JWT tokens
  const COOKIE_NAME = 'auth_token';
  const getCookieOptions = () => ({
    httpOnly: true, // Prevents XSS attacks from accessing token
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    path: '/',
  });

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow GraphQL Playground
  }));

  // Rate limiting for GraphQL endpoint (prevents brute force attacks)
  const graphqlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      errors: [{
        message: 'Too many requests, please try again later.',
        extensions: { code: 'RATE_LIMITED' }
      }]
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Stricter rate limiting for authentication attempts
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth attempts per windowMs
    message: {
      errors: [{
        message: 'Too many authentication attempts, please try again later.',
        extensions: { code: 'RATE_LIMITED' }
      }]
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Only apply to requests that look like auth mutations
    skip: (req) => {
      const body = req.body;
      if (!body?.query) return true;
      const query = body.query.toLowerCase();
      return !query.includes('signin') && !query.includes('signup');
    },
  });

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

  // Health check endpoint with database connectivity verification
  app.get('/health', async (req, res) => {
    try {
      // Verify database connection
      const dbState = mongoose.connection.readyState;
      const dbConnected = dbState === 1; // 1 = connected

      if (dbConnected) {
        // Ping the database to ensure it's responsive
        await mongoose.connection.db.admin().ping();
        res.status(200).json({
          status: 'OK',
          database: 'connected',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          status: 'DEGRADED',
          database: 'disconnected',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'ERROR',
        database: 'error',
        timestamp: new Date().toISOString(),
      });
    }
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
    // Check for token in httpOnly cookie first (preferred), then fall back to x-token header
    const token = req.cookies?.[COOKIE_NAME] || req.headers['x-token'];

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

  // Build executable schema for complexity analysis
  const { makeExecutableSchema } = await import('@graphql-tools/schema');
  const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  });

  const server = new ApolloServer({
    schema: executableSchema,
    introspection: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      serverTimingPlugin,
      createQueryComplexityPlugin(executableSchema),
    ],
    validationRules: getValidationRules(),
    formatError: (formattedError, error) => {
      // Log errors in development only
      if (process.env.NODE_ENV === 'development') {
        console.error('GraphQL Error:', {
          message: error.message,
          path: error.path,
          stack: error.stack,
        });
      }

      // User-facing error codes that should pass through in production
      const userFacingCodes = [
        'BAD_USER_INPUT',
        'UNAUTHENTICATED',
        'FORBIDDEN',
        'NOT_FOUND',
        'QUERY_TOO_COMPLEX',
        'RATE_LIMITED',
      ];

      // Specific messages that are safe to show users
      const userFacingMessages = [
        'Student not found',
        'Invalid student ID format',
        'You are not authenticated as a user',
        'Your session has expired. Please sign in again.',
        'You have entered invalid login credentials',
      ];

      const errorCode = error.extensions?.code;
      const errorMessage = error.message || '';

      if (process.env.NODE_ENV === 'production') {
        // Allow user-facing errors through
        if (userFacingCodes.includes(errorCode) || userFacingMessages.includes(errorMessage)) {
          return formattedError;
        }
        // Mask all other errors
        return new GraphQLError('Internal server error', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
      return formattedError;
    },
  });

  await server.start();

  app.use(
    '/graphql',
    cors(corsOption),
    express.json({ limit: '100kb' }), // Prevent payload DoS attacks
    graphqlLimiter, // General rate limiting
    authLimiter, // Stricter auth rate limiting
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
          res, // Pass response object for cookie operations
          // Cookie utilities for auth resolvers
          setAuthCookie: (token) => {
            res.cookie(COOKIE_NAME, token, getCookieOptions());
          },
          clearAuthCookie: () => {
            res.clearCookie(COOKIE_NAME, { path: '/' });
          },
          timing,
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

