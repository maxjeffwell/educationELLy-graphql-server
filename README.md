<div align="center">

# 🚀 EducationELLy GraphQL Server

<p align="center">
  <img src="https://img.shields.io/badge/Apollo_Server-4.x-2873b4?style=for-the-badge&logo=apollo-graphql&logoColor=white" alt="Apollo Server" />
  <img src="https://img.shields.io/badge/Node.js-18+-86c64e?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/GraphQL-16.11.0-fb9438?style=for-the-badge&logo=graphql&logoColor=white" alt="GraphQL" />
  <img src="https://img.shields.io/badge/MongoDB-Latest-2873b4?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/License-GNU_GPLv3-86c64e?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong style="color: #2873b4;">A modern GraphQL API server built with Apollo Server 4.x, Express, and MongoDB</strong>
</p>

<p align="center">
  <em style="color: #fb9438;">For managing English Language Learner (ELL) student data and educational resources</em>
</p>

</div>

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

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication system
- **Role-based Access**: Granular authorization controls
- **Password Security**: bcryptjs hashing with salt rounds
- **CORS Protection**: Configurable cross-origin resource sharing

</td>
<td width="50%">

### 📊 Data Management
- **Student CRUD**: Complete student lifecycle management
- **User Management**: Registration and profile operations
- **Data Validation**: Comprehensive input validation
- **Batch Loading**: Efficient DataLoader implementations

</td>
</tr>
<tr>
<td width="50%">

### ⚡ Performance & Scalability
- **Apollo Server 4.x**: Latest GraphQL server technology
- **MongoDB Integration**: Flexible document-based storage
- **Optimized Queries**: DataLoader for N+1 query prevention
- **Production Ready**: Heroku deployment configuration

</td>
<td width="50%">

### 🛠️ Developer Experience
- **GraphQL Playground**: Interactive API exploration
- **Hot Reloading**: Nodemon development server
- **ES6+ Support**: Modern JavaScript with Babel
- **Comprehensive Testing**: Mocha & Chai test suite

</td>
</tr>
</table>

## 🛠️ Tech Stack

<div align="center">

| **Category** | **Technology** | **Version** | **Purpose** |
|:---:|:---:|:---:|:---:|
| **Runtime** | ![Node.js](https://img.shields.io/badge/Node.js-86c64e?style=flat&logo=node.js&logoColor=white) | 18.0.0+ | JavaScript Runtime |
| **Framework** | ![Express](https://img.shields.io/badge/Express-2873b4?style=flat&logo=express&logoColor=white) | Latest | Web Framework |
| **GraphQL** | ![Apollo](https://img.shields.io/badge/Apollo_Server-fb9438?style=flat&logo=apollo-graphql&logoColor=white) | 4.x | GraphQL Server |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-86c64e?style=flat&logo=mongodb&logoColor=white) | Latest | Document Database |
| **ODM** | ![Mongoose](https://img.shields.io/badge/Mongoose-2873b4?style=flat&logo=mongodb&logoColor=white) | 8.16.3 | Object Modeling |
| **Authentication** | ![JWT](https://img.shields.io/badge/JWT-fb9438?style=flat&logo=json-web-tokens&logoColor=white) | 9.0.2 | Token Auth |
| **Security** | ![bcrypt](https://img.shields.io/badge/bcryptjs-86c64e?style=flat&logo=security&logoColor=white) | 2.4.3 | Password Hashing |
| **Data Loading** | ![DataLoader](https://img.shields.io/badge/DataLoader-2873b4?style=flat&logo=graphql&logoColor=white) | 1.4.0 | Batch Loading |
| **Testing** | ![Mocha](https://img.shields.io/badge/Mocha-fb9438?style=flat&logo=mocha&logoColor=white) | 11.7.1 | Test Framework |
| **Linting** | ![ESLint](https://img.shields.io/badge/ESLint-86c64e?style=flat&logo=eslint&logoColor=white) | 8.57.0 | Code Quality |

</div>

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

---

<div align="center">

### 📬 Contact

<p align="center">
  <a href="mailto:jeff@el-jefe.me">
    <img src="https://img.shields.io/badge/Email-jeff@el--jefe.me-fb9438?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />
  </a>
  <a href="https://github.com/maxjeffwell">
    <img src="https://img.shields.io/badge/GitHub-maxjeffwell-2873b4?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://www.el-jefe.me">
    <img src="https://img.shields.io/badge/Portfolio-el--jefe.me-86c64e?style=for-the-badge&logo=internet-explorer&logoColor=white" alt="Portfolio" />
  </a>
</p>

</div>

## 🙏 Acknowledgments

<div align="center">

| Technology | Purpose | Recognition |
|:---:|:---:|:---:|
| ![Apollo](https://img.shields.io/badge/Apollo_Server_4.x-2873b4?style=flat&logo=apollo-graphql&logoColor=white) | GraphQL Foundation | Modern API Architecture |
| ![GraphQL](https://img.shields.io/badge/GraphQL_Best_Practices-fb9438?style=flat&logo=graphql&logoColor=white) | Design Patterns | Industry Standards |
| ![Education](https://img.shields.io/badge/ELL_Education-86c64e?style=flat&logo=education&logoColor=white) | Target Audience | Educational Impact |

</div>

<p align="center">
  <em style="color: #fb9438;">Built with ❤️ for educators managing English Language Learners worldwide</em>
</p>

---

<div align="center">

### 📊 Project Metadata

<table>
<tr>
<td width="50%">

**Project Information**
- **Name**: EducationELLy GraphQL Server
- **Version**: 1.0.0
- **Created**: 2024
- **Status**: Production Ready

</td>
<td width="50%">

**Technical Details**
- **License**: GNU GPLv3
- **Node.js**: 18.0.0+
- **Category**: Education Technology
- **Type**: ELL Management System

</td>
</tr>
</table>

**Repository**: [github.com/maxjeffwell/educationelly-graphql](https://github.com/maxjeffwell/educationelly-graphql)

</div>