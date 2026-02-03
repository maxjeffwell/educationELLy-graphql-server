import * as Sentry from '@sentry/node';

// Initialize Sentry - must be called before any other imports in index.js
export const initSentry = () => {
  // Only initialize if DSN is configured
  if (!process.env.SENTRY_DSN) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('SENTRY_DSN not configured - error tracking disabled');
    }
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

    // Profile sampling rate (relative to tracesSampleRate)
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Integrations
    integrations: [
      // Capture unhandled promise rejections
      Sentry.captureConsoleIntegration({ levels: ['error'] }),
      // HTTP request tracing
      Sentry.httpIntegration(),
      // Express middleware tracing
      Sentry.expressIntegration(),
      // GraphQL tracing
      Sentry.graphqlIntegration(),
      // MongoDB tracing
      Sentry.mongooseIntegration(),
    ],

    // Filter sensitive data from being sent to Sentry
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['x-token'];
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove password from request data
      if (event.request?.data) {
        try {
          const data =
            typeof event.request.data === 'string'
              ? JSON.parse(event.request.data)
              : event.request.data;

          if (data.variables?.password) {
            data.variables.password = '[FILTERED]';
          }
          if (data.variables?.input?.password) {
            data.variables.input.password = '[FILTERED]';
          }
          event.request.data =
            typeof event.request.data === 'string'
              ? JSON.stringify(data)
              : data;
        } catch {
          // Ignore JSON parse errors
        }
      }

      return event;
    },

    // Filter breadcrumbs to reduce noise
    beforeBreadcrumb(breadcrumb) {
      // Skip console.log breadcrumbs in production
      if (
        process.env.NODE_ENV === 'production' &&
        breadcrumb.category === 'console' &&
        breadcrumb.level !== 'error'
      ) {
        return null;
      }
      return breadcrumb;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Ignore authentication errors (expected behavior)
      'You are not authenticated',
      'Your session has expired',
      'invalid login credentials',
      // Ignore rate limiting (expected behavior)
      'Too many requests',
      // Ignore validation errors (user input)
      'BAD_USER_INPUT',
    ],
  });

  console.log('Sentry initialized for error tracking and performance monitoring');
};

// Capture exception with context
export const captureException = (error, context = {}) => {
  Sentry.withScope((scope) => {
    if (context.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
      });
    }

    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureException(error);
  });
};

// Capture message with level
export const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.withScope((scope) => {
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureMessage(message, level);
  });
};

// Start a performance transaction
export const startTransaction = (name, op) => {
  return Sentry.startSpan({ name, op });
};

// Express error handler middleware
export const sentryErrorHandler = Sentry.setupExpressErrorHandler;

// Set user context for the current scope
export const setUser = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.id || user._id,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
};

// Add breadcrumb for debugging
export const addBreadcrumb = (breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

// Flush events before process exits
export const flush = async (timeout = 2000) => {
  await Sentry.close(timeout);
};

export default Sentry;
