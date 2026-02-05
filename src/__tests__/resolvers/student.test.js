import request from 'supertest';
import {
  createTestServer,
  createTestUser,
  createTestStudent,
} from '../testServer';
import models from '../../models';

describe('Student Resolvers', () => {
  let app;
  let server;
  let authToken;

  beforeAll(async () => {
    const testServer = await createTestServer();
    app = testServer.app;
    server = testServer.server;
  });

  beforeEach(async () => {
    // Create authenticated user for each test
    const { token } = await createTestUser();
    authToken = token;
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Query: students', () => {
    it('returns error when not authenticated', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              students {
                _id
                fullName
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('not authenticated');
    });

    it('returns list of students when authenticated', async () => {
      await createTestStudent({ fullName: 'Student One' });
      await createTestStudent({ fullName: 'Student Two' });

      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            query {
              students {
                _id
                fullName
                school
                ellStatus
                active
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.students).toBeInstanceOf(Array);
      expect(response.body.data.students.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array when no students exist', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            query {
              students {
                _id
                fullName
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.students).toBeInstanceOf(Array);
    });
  });

  describe('Query: student', () => {
    it('returns a student by ID', async () => {
      const student = await createTestStudent({
        fullName: 'Find Me Student',
        ellStatus: 'Active ELL',
      });

      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            query GetStudent($_id: ID!) {
              student(_id: $_id) {
                _id
                fullName
                ellStatus
              }
            }
          `,
          variables: { _id: student._id.toString() },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.student).toBeTruthy();
      expect(response.body.data.student.fullName).toBe('Find Me Student');
      expect(response.body.data.student.ellStatus).toBe('ACTIVE_ELL');
    });

    it('returns null for non-existent student', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            query GetStudent($_id: ID!) {
              student(_id: $_id) {
                _id
                fullName
              }
            }
          `,
          variables: { _id: '507f1f77bcf86cd799439011' },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.student).toBeNull();
    });

    it('returns error when not authenticated', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query GetStudent($_id: ID!) {
              student(_id: $_id) {
                _id
              }
            }
          `,
          variables: { _id: '507f1f77bcf86cd799439011' },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('Mutation: createStudent', () => {
    it('creates a new student when authenticated', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation CreateStudent($input: NewStudentInput!) {
              createStudent(input: $input) {
                _id
                fullName
                school
                gradeLevel
                ellStatus
                active
              }
            }
          `,
          variables: {
            input: {
              fullName: 'New Test Student',
              school: 'Test Elementary',
              gradeLevel: '3',
              ellStatus: 'ACTIVE_ELL',
              active: true,
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createStudent).toBeTruthy();
      expect(response.body.data.createStudent.fullName).toBe(
        'New Test Student'
      );
      expect(response.body.data.createStudent.school).toBe('Test Elementary');
      expect(response.body.data.createStudent.active).toBe(true);
    });

    it('creates student with minimal required fields', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation CreateStudent($input: NewStudentInput!) {
              createStudent(input: $input) {
                _id
                fullName
                active
              }
            }
          `,
          variables: {
            input: {
              fullName: 'Minimal Student',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createStudent.fullName).toBe('Minimal Student');
      expect(response.body.data.createStudent.active).toBe(true); // Default value
    });

    it('returns error when fullName is missing', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation CreateStudent($input: NewStudentInput!) {
              createStudent(input: $input) {
                _id
              }
            }
          `,
          variables: {
            input: {
              school: 'Test School',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
    });

    it('returns error when not authenticated', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation CreateStudent($input: NewStudentInput!) {
              createStudent(input: $input) {
                _id
              }
            }
          `,
          variables: {
            input: {
              fullName: 'Unauthorized Student',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('not authenticated');
    });

    it('validates enum fields', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation CreateStudent($input: NewStudentInput!) {
              createStudent(input: $input) {
                _id
              }
            }
          `,
          variables: {
            input: {
              fullName: 'Invalid Enum Student',
              gradeLevel: 'Invalid Grade',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('Mutation: updateStudent', () => {
    it('updates an existing student', async () => {
      const student = await createTestStudent({
        fullName: 'Original Name',
        ellStatus: 'Active ELL',
      });

      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation UpdateStudent($_id: ID!, $input: UpdateStudentInput!) {
              updateStudent(_id: $_id, input: $input) {
                _id
                fullName
                ellStatus
              }
            }
          `,
          variables: {
            _id: student._id.toString(),
            input: {
              fullName: 'Updated Name',
              ellStatus: 'EXITED',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateStudent.fullName).toBe('Updated Name');
      expect(response.body.data.updateStudent.ellStatus).toBe('EXITED');
    });

    it('returns error for non-existent student', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation UpdateStudent($_id: ID!, $input: UpdateStudentInput!) {
              updateStudent(_id: $_id, input: $input) {
                _id
              }
            }
          `,
          variables: {
            _id: '507f1f77bcf86cd799439011',
            input: {
              fullName: 'Non-existent Student',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('not found');
    });

    it('returns error when not authenticated', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation UpdateStudent($_id: ID!, $input: UpdateStudentInput!) {
              updateStudent(_id: $_id, input: $input) {
                _id
              }
            }
          `,
          variables: {
            _id: '507f1f77bcf86cd799439011',
            input: {
              fullName: 'Unauthorized Update',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('Mutation: deleteStudent', () => {
    it('deletes an existing student', async () => {
      const student = await createTestStudent({
        fullName: 'Delete Me',
      });

      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation DeleteStudent($_id: ID!) {
              deleteStudent(_id: $_id)
            }
          `,
          variables: { _id: student._id.toString() },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteStudent).toBe(true);

      // Verify student was deleted
      const dbStudent = await models.Student.findById(student._id);
      expect(dbStudent).toBeNull();
    });

    it('returns error for non-existent student', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation DeleteStudent($_id: ID!) {
              deleteStudent(_id: $_id)
            }
          `,
          variables: { _id: '507f1f77bcf86cd799439011' },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('not found');
    });

    it('returns error for invalid ID format', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation DeleteStudent($_id: ID!) {
              deleteStudent(_id: $_id)
            }
          `,
          variables: { _id: 'invalid-id' },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('Invalid');
    });

    it('returns error when not authenticated', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation DeleteStudent($_id: ID!) {
              deleteStudent(_id: $_id)
            }
          `,
          variables: { _id: '507f1f77bcf86cd799439011' },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('Student field validations', () => {
    it('validates gradeLevel enum values', async () => {
      const validGrades = ['K', '1', '2', '3', '4', '5'];

      for (const grade of validGrades) {
        const response = await request(app)
          .post('/graphql')
          .set('x-token', authToken)
          .send({
            query: `
              mutation CreateStudent($input: NewStudentInput!) {
                createStudent(input: $input) {
                  gradeLevel
                }
              }
            `,
            variables: {
              input: {
                fullName: `Grade ${grade} Student`,
                gradeLevel: grade,
              },
            },
          });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.createStudent.gradeLevel).toBe(grade);
      }
    });

    it('validates ellStatus enum values', async () => {
      const validStatuses = ['ACTIVE_ELL', 'EXITED', 'MONITORING', 'NEVER_ELL', 'REFUSED_SERVICES'];

      for (const status of validStatuses) {
        const response = await request(app)
          .post('/graphql')
          .set('x-token', authToken)
          .send({
            query: `
              mutation CreateStudent($input: NewStudentInput!) {
                createStudent(input: $input) {
                  ellStatus
                }
              }
            `,
            variables: {
              input: {
                fullName: `${status} Student`,
                ellStatus: status,
              },
            },
          });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.createStudent.ellStatus).toBe(status);
      }
    });

    it('validates max length for fullName', async () => {
      const longName = 'A'.repeat(101); // Exceeds MAX_NAME_LENGTH of 100

      const response = await request(app)
        .post('/graphql')
        .set('x-token', authToken)
        .send({
          query: `
            mutation CreateStudent($input: NewStudentInput!) {
              createStudent(input: $input) {
                _id
              }
            }
          `,
          variables: {
            input: {
              fullName: longName,
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeTruthy();
      expect(response.body.errors[0].message).toContain('cannot exceed');
    });
  });
});
