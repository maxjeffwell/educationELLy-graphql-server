# EducationELLy GraphQL Server

A modern GraphQL API server built with Apollo Server 4.x, Express, and MongoDB for managing English Language Learner (ELL) student data and educational resources.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **GraphQL API** - Modern GraphQL API built with Apollo Server 4.x
- **Authentication & Authorization** - JWT-based authentication with role-based access control
- **Student Management** - Full CRUD operations for managing ELL student records
- **User Management** - User registration, authentication, and profile management
- **Data Validation** - Input validation for all mutations
- **Batch Loading** - Efficient data loading with DataLoader
- **Real-time Updates** - Support for GraphQL subscriptions (infrastructure ready)
- **Production Ready** - Configured for deployment on Heroku with production seeding scripts

## Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **GraphQL Server**: Apollo Server 4.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Data Loading**: DataLoader for batch loading
- **Development**: Babel for ES6+ support, Nodemon for hot reloading
- **Testing**: Mocha & Chai
- **Linting**: ESLint with Airbnb base configuration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/educationelly-graphql-server.git
cd educationelly-graphql-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration (see [Environment Variables](#environment-variables))

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/educationelly

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
NODE_ENV=development
PORT=8000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Test Database (for running tests)
TEST_DATABASE=mytestdatabase
```

## Running the Application

### Development Mode

Start the development server with hot reloading:
```bash
npm run dev
```

### Production Mode

Start the production server:
```bash
npm start
```

The GraphQL playground will be available at `http://localhost:8000/graphql` (development only).

### Database Seeding

Seed the production database with initial data:
```bash
# Seed with users and students
node scripts/seed-production.js

# Seed with students only
node scripts/seed-students-only.js
```

## API Documentation

### GraphQL Schema

#### Queries

```graphql
type Query {
  # User queries
  users: [User!]!          # Get all users (requires authentication)
  user(_id: ID!): User     # Get user by ID
  me: User                 # Get current authenticated user
  
  # Student queries
  students: [Student!]!    # Get all students (requires authentication)
  student(_id: ID!): Student # Get student by ID
}
```

#### Mutations

```graphql
type Mutation {
  # Authentication
  signUp(email: String!, password: String!): Token!
  signIn(login: String!, password: String!): Token!
  
  # Student operations
  createStudent(input: NewStudentInput!): Student!
  updateStudent(_id: ID!, input: UpdateStudentInput!): Student!
  deleteStudent(_id: ID!): Boolean!
}
```

#### Types

```graphql
type User {
  _id: ID!
  email: String!
  createdAt: Date!
  updatedAt: Date!
}

type Student {
  _id: ID!
  fullName: String!
  school: String
  teacher: String
  dateOfBirth: Date
  gender: String
  race: String
  gradeLevel: String
  nativeLanguage: String
  cityOfBirth: String
  countryOfBirth: String
  ellStatus: String
  compositeLevel: String
  active: Boolean
  designation: String
  createdAt: Date!
  updatedAt: Date!
}

type Token {
  token: String!
}
```

### Example Queries and Mutations

#### Sign Up
```graphql
mutation SignUp {
  signUp(email: "user@example.com", password: "securepassword") {
    token
  }
}
```

#### Sign In
```graphql
mutation SignIn {
  signIn(login: "user@example.com", password: "securepassword") {
    token
  }
}
```

#### Create Student
```graphql
mutation CreateStudent {
  createStudent(input: {
    fullName: "John Doe"
    school: "Lincoln Elementary"
    teacher: "Ms. Smith"
    gradeLevel: "3rd"
    nativeLanguage: "Spanish"
    ellStatus: "Active"
  }) {
    _id
    fullName
    school
  }
}
```

#### Get All Students
```graphql
query GetStudents {
  students {
    _id
    fullName
    school
    teacher
    ellStatus
    gradeLevel
  }
}
```

## Database Schema

### User Model
- **email**: Unique email address (validated)
- **password**: Hashed password (min 7 characters)
- **timestamps**: createdAt, updatedAt (automatic)

### Student Model
- **fullName**: Student's full name (required)
- **school**: School name
- **teacher**: Teacher name
- **dateOfBirth**: Birth date
- **gender**: Student gender
- **race**: Race/ethnicity
- **gradeLevel**: Current grade level
- **nativeLanguage**: Student's native language
- **cityOfBirth**: Birth city
- **countryOfBirth**: Birth country
- **ellStatus**: English Language Learner status
- **compositeLevel**: Composite proficiency level
- **active**: Active enrollment status
- **designation**: Special designation
- **timestamps**: createdAt, updatedAt (automatic)

## Authentication

The API uses JWT-based authentication. To authenticate requests:

1. Obtain a token by signing in or signing up
2. Include the token in the `x-token` header for authenticated requests:
```
x-token: your-jwt-token-here
```

### Authorization Levels

- **Public**: Sign up, sign in
- **Authenticated**: All student operations, user queries
- **Admin**: Special administrative functions (role-based)

## Testing

The test suite uses Mocha and Chai. Tests require a running server instance.

### Running Tests

1. Start the test server in one terminal:
```bash
npm run test:run-server
```

2. In another terminal, run the tests:
```bash
npm run test:execute-test
```

### Test Coverage

- API integration tests
- User authentication tests
- Student CRUD operation tests
- Authorization tests

## Deployment

### Heroku Deployment

The project includes a `Procfile` for Heroku deployment.

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Set environment variables:
```bash
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS=https://your-frontend.com
```

3. Deploy:
```bash
git push heroku master
```

4. Seed production data (optional):
```bash
heroku run node scripts/seed-production.js
```

## Project Structure

```
educationelly-graphql-server/
├── scripts/                 # Database seeding scripts
│   ├── seed-production.js
│   └── seed-students-only.js
├── src/
│   ├── index.js            # Application entry point
│   ├── loaders/            # DataLoader implementations
│   │   ├── index.js
│   │   ├── student.js
│   │   └── user.js
│   ├── models/             # Mongoose models
│   │   ├── index.js
│   │   ├── student.js
│   │   └── user.js
│   ├── resolvers/          # GraphQL resolvers
│   │   ├── authorization.js
│   │   ├── index.js
│   │   ├── student.js
│   │   └── user.js
│   ├── schema/             # GraphQL type definitions
│   │   ├── index.js
│   │   ├── student.js
│   │   └── user.js
│   └── tests/              # Test files
│       ├── api.js
│       ├── student.spec.js
│       └── user.spec.js
├── .babelrc               # Babel configuration
├── .env.example           # Environment variables example
├── .eslintrc.json         # ESLint configuration
├── .gitignore
├── CLAUDE.md              # Development notes
├── LICENSE
├── package.json
├── Procfile               # Heroku deployment config
└── README.md
```

## Next Steps

Here are some recommended next steps for improving and extending the EducationELLy GraphQL Server:

### Security Enhancements
- [ ] Implement rate limiting to prevent API abuse
- [ ] Add request validation middleware for additional security
- [ ] Set up helmet.js for enhanced HTTP header security
- [ ] Implement field-level authorization for sensitive student data
- [ ] Add API key authentication for third-party integrations

### Feature Development
- [ ] **Assessment Tracking** - Add models and resolvers for tracking student assessments and progress
- [ ] **File Uploads** - Implement file upload functionality for student documents using GraphQL multipart requests
- [ ] **Reporting Dashboard** - Create aggregation queries for generating student performance reports
- [ ] **Bulk Operations** - Add batch import/export functionality for student data
- [ ] **Notifications** - Implement email notifications for important student updates
- [ ] **Audit Logging** - Add comprehensive logging for all data modifications

### Performance Optimizations
- [ ] Implement Redis caching for frequently accessed data
- [ ] Add database indexing strategies for common queries
- [ ] Set up query complexity analysis to prevent expensive queries
- [ ] Implement pagination cursors for large datasets
- [ ] Add query depth limiting

### Developer Experience
- [ ] Set up automated API documentation generation
- [ ] Add GraphQL query examples and playground snippets
- [ ] Create developer onboarding guide
- [ ] Implement automated changelog generation
- [ ] Add pre-commit hooks for code quality checks

### Testing & Quality
- [ ] Increase test coverage to 90%+
- [ ] Add integration tests for all GraphQL operations
- [ ] Implement load testing for performance benchmarking
- [ ] Set up continuous integration with GitHub Actions
- [ ] Add mutation testing for robust test suite validation

### Infrastructure
- [ ] Containerize application with Docker
- [ ] Create Kubernetes deployment manifests
- [ ] Set up monitoring with Prometheus/Grafana
- [ ] Implement health check endpoints
- [ ] Add support for horizontal scaling

### Data Management
- [ ] Implement soft deletes for student records
- [ ] Add data archival strategies for old records
- [ ] Create backup and restore procedures
- [ ] Implement GDPR compliance features (data export/deletion)
- [ ] Add data validation rules for all fields

### Frontend Integration
- [ ] Create TypeScript type definitions from GraphQL schema
- [ ] Build React hooks for common queries/mutations
- [ ] Develop a GraphQL client library
- [ ] Add real-time subscriptions for live updates
- [ ] Create sample frontend application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (Airbnb ESLint configuration)
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Linting

Run ESLint to check code style:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint:fix
```

## License

This project is licensed under the GNU GPLv3 License - see the LICENSE file for details.

## Author

Jeff Maxwell <maxjeffwell@gmail.com>

## Acknowledgments

- Built with Apollo Server 4.x
- Inspired by best practices in GraphQL API design
- Designed for educational institutions managing ELL students