import { expect } from 'chai';

import * as userApi from './api';

describe('students', () => {
  let adminToken;
  let testStudentId;

  before(async () => {
    // Create a test admin user and get token for authenticated requests
    await userApi.signUp({
      email: 'admin@educationelly.com',
      password: 'testpassword123',
    });

    const {
      data: {
        data: {
          signIn: { token },
        },
      },
    } = await userApi.signIn({
      login: 'admin@educationelly.com',
      password: 'testpassword123',
    });
    adminToken = token;
  });

  describe('students: [Student!]!', () => {
    it('returns an error when user is not authenticated', async () => {
      const {
        data: { errors },
      } = await userApi.students();

      expect(errors[0].message).to.eql('You are not authenticated as a user');
    });

    it('returns a list of students when authenticated', async () => {
      const { data } = await userApi.students(adminToken);

      expect(data.data.students).to.be.an('array');
      expect(data.data.students.length).to.be.greaterThan(0);
      
      const firstStudent = data.data.students[0];
      expect(firstStudent).to.have.property('_id');
      expect(firstStudent).to.have.property('fullName');
      expect(firstStudent).to.have.property('school');
      expect(firstStudent).to.have.property('ellStatus');
    });
  });

  describe('student(_id: ID!): Student', () => {
    it('returns a student when student can be found', async () => {
      // First get all students to get a valid ID
      const { data } = await userApi.students(adminToken);
      const studentId = data.data.students[0]._id;

      const result = await userApi.student({ _id: studentId }, adminToken);

      expect(result.data.data.student).to.be.an('object');
      expect(result.data.data.student._id).to.equal(studentId);
      expect(result.data.data.student).to.have.property('fullName');
      expect(result.data.data.student).to.have.property('ellStatus');
    });

    it('returns null when student cannot be found', async () => {
      const result = await userApi.student({ _id: '507f1f77bcf86cd799439011' }, adminToken);

      expect(result.data.data.student).to.be.null;
    });

    it('returns an error when user is not authenticated', async () => {
      const {
        data: { errors },
      } = await userApi.student({ _id: '507f1f77bcf86cd799439011' });

      expect(errors[0].message).to.eql('You are not authenticated as a user');
    });
  });

  describe('createStudent(input: NewStudentInput!): Student!', () => {
    it('creates a new student when authenticated', async () => {
      const newStudentData = {
        input: {
          fullName: 'Test Student',
          school: 'Test Elementary',
          teacher: 'Ms. Test',
          gradeLevel: '3rd Grade',
          nativeLanguage: 'English',
          ellStatus: 'Beginning',
          compositeLevel: 'Level 1',
          designation: 'ELL',
          active: true,
        },
      };

      const { data } = await userApi.createStudent(newStudentData, adminToken);

      expect(data.data.createStudent).to.be.an('object');
      expect(data.data.createStudent.fullName).to.equal('Test Student');
      expect(data.data.createStudent.school).to.equal('Test Elementary');
      expect(data.data.createStudent.ellStatus).to.equal('Beginning');
      expect(data.data.createStudent.active).to.be.true;

      // Store the ID for later tests
      testStudentId = data.data.createStudent._id;
    });

    it('returns an error when user is not authenticated', async () => {
      const newStudentData = {
        input: {
          fullName: 'Test Student 2',
          school: 'Test School',
        },
      };

      const {
        data: { errors },
      } = await userApi.createStudent(newStudentData);

      expect(errors[0].message).to.eql('You are not authenticated as a user');
    });

    it('returns an error when required field is missing', async () => {
      const invalidStudentData = {
        input: {
          school: 'Test School',
          // Missing required fullName
        },
      };

      const {
        data: { errors },
      } = await userApi.createStudent(invalidStudentData, adminToken);

      expect(errors).to.be.an('array');
      expect(errors[0].message).to.include('fullName');
    });
  });

  describe('updateStudent(_id: ID!, input: UpdateStudentInput!): Student!', () => {
    it('updates a student when authenticated', async () => {
      const updateData = {
        _id: testStudentId,
        input: {
          fullName: 'Updated Test Student',
          ellStatus: 'Intermediate',
          active: false,
        },
      };

      const { data } = await userApi.updateStudent(updateData, adminToken);

      expect(data.data.updateStudent).to.be.an('object');
      expect(data.data.updateStudent.fullName).to.equal('Updated Test Student');
      expect(data.data.updateStudent.ellStatus).to.equal('Intermediate');
      expect(data.data.updateStudent.active).to.be.false;
    });

    it('returns an error when student is not found', async () => {
      const updateData = {
        _id: '507f1f77bcf86cd799439011',
        input: {
          fullName: 'Non-existent Student',
        },
      };

      const {
        data: { errors },
      } = await userApi.updateStudent(updateData, adminToken);

      expect(errors[0].message).to.include('Student not found');
    });

    it('returns an error when user is not authenticated', async () => {
      const updateData = {
        _id: testStudentId,
        input: {
          fullName: 'Unauthorized Update',
        },
      };

      const {
        data: { errors },
      } = await userApi.updateStudent(updateData);

      expect(errors[0].message).to.eql('You are not authenticated as a user');
    });
  });

  describe('deleteStudent(_id: ID!): Boolean!', () => {
    it('deletes a student when authenticated', async () => {
      const { data } = await userApi.deleteStudent({ _id: testStudentId }, adminToken);

      expect(data.data.deleteStudent).to.be.true;

      // Verify student is deleted
      const verifyResult = await userApi.student({ _id: testStudentId }, adminToken);
      expect(verifyResult.data.data.student).to.be.null;
    });

    it('returns false when student is not found', async () => {
      const { data } = await userApi.deleteStudent({ _id: '507f1f77bcf86cd799439011' }, adminToken);

      expect(data.data.deleteStudent).to.be.false;
    });

    it('returns an error when user is not authenticated', async () => {
      const {
        data: { errors },
      } = await userApi.deleteStudent({ _id: '507f1f77bcf86cd799439011' });

      expect(errors[0].message).to.eql('You are not authenticated as a user');
    });
  });

  describe('Student data validation', () => {
    it('creates student with all optional fields', async () => {
      const completeStudentData = {
        input: {
          fullName: 'Complete Student Profile',
          school: 'Comprehensive Elementary',
          teacher: 'Mrs. Complete',
          dateOfBirth: '2012-06-15T00:00:00.000Z',
          gender: 'Female',
          race: 'Asian',
          gradeLevel: '4th Grade',
          nativeLanguage: 'Vietnamese',
          cityOfBirth: 'Ho Chi Minh City',
          countryOfBirth: 'Vietnam',
          ellStatus: 'Advanced',
          compositeLevel: 'Level 4',
          active: true,
          designation: 'ELL',
        },
      };

      const response = await userApi.createStudent(completeStudentData, adminToken);

      // Check for errors first  
      if (response.data.errors) {
        console.log('CreateStudent errors:', response.data.errors);
      }

      expect(response).to.exist;
      expect(response.data).to.exist;
      
      if (!response.data.data) {
        console.log('Student response data:', response.data);
      }
      
      expect(response.data.data).to.exist;
      expect(response.data.data.createStudent).to.be.an('object');
      
      const data = response.data;
      expect(data.data.createStudent.fullName).to.equal('Complete Student Profile');
      expect(data.data.createStudent.ellStatus).to.equal('Advanced');

      // Clean up
      await userApi.deleteStudent({ _id: data.data.createStudent._id }, adminToken);
    });

    it('handles boolean fields correctly', async () => {
      const booleanTestData = {
        input: {
          fullName: 'Boolean Test Student',
          active: false,
        },
      };

      const { data } = await userApi.createStudent(booleanTestData, adminToken);

      expect(data.data.createStudent.active).to.be.false;

      // Clean up
      await userApi.deleteStudent({ _id: data.data.createStudent._id }, adminToken);
    });
  });
});