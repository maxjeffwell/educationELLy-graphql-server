# EducationELLy GraphQL Server

## Quick Start

```bash
# Development server
npm start

# Run tests (requires server running)
npm run test:run-server  # Terminal 1
npm run test:execute-test  # Terminal 2
```

## Architecture Overview

This is an Apollo Server 4.x GraphQL API built with Express and MongoDB. The codebase follows a modular architecture with clear separation of concerns.

### Key Components

**GraphQL Layer**
- `src/schema/` - GraphQL type definitions split by domain (user, student)
- `src/resolvers/` - Resolver functions with authorization logic
- Uses Apollo Server 4.x with Express middleware integration

**Data Layer**
- `src/models/` - Mongoose models for User and Student entities
- `src/loaders/` - DataLoader implementations for efficient batch loading
- MongoDB connection via Mongoose

**Authentication**
- JWT-based authentication via `x-token` header
- Authorization helpers in `src/resolvers/authorization.js`
- Role-based access control (appears to support admin roles)

### Environment Configuration

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `TEST_DATABASE` - Database name for testing

### Testing

Tests use Mocha/Chai and require a running server instance. The test suite includes:
- API integration tests (`src/tests/api.js`)
- User-specific tests (`src/tests/user.spec.js`)

### Build Configuration

- Uses Babel for ES6+ transpilation (Node.js current target)
- Nodemon for development hot-reloading
- No linting configuration currently set up

### Recent Updates

The project recently underwent a major upgrade from Apollo Server 2.x to 4.x, which included:
- Migration to new Apollo Server 4.x API patterns
- Updated Express middleware integration
- Modernized dependency versions

### Development Notes

- No ESLint configuration present - consider adding for code consistency
- Test database isolation via `TEST_DATABASE` environment variable
- CORS configured with credentials support
- Morgan logger for HTTP request logging in development