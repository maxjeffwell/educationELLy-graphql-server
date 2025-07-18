import { gql } from 'graphql-tag';

export default gql`
  extend type Query {
    students: [Student!]!
    student(_id: ID!): Student
  }
  
  extend type Mutation {
    createStudent(input: NewStudentInput!): Student!
    updateStudent(_id: ID!, input: UpdateStudentInput!): Student!
    deleteStudent(_id: ID!): Boolean!
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
    ellStatus: String
    compositeLevel: String
    active: Boolean
    designation: String
    countryOfBirth: String
    createdAt: Date!
    updatedAt: Date!
  }
  
  input UpdateStudentInput {
    fullName: String
    school: String
    teacher: String
    dateOfBirth: Date
    gender: String
    race: String
    gradeLevel: String
    nativeLanguage: String
    cityOfBirth: String
    ellStatus: String
    compositeLevel: String
    active: Boolean
    designation: String
    countryOfBirth: String
  }
  
  input NewStudentInput {
    fullName: String!
    school: String
    teacher: String
    dateOfBirth: Date
    gender: String
    race: String
    gradeLevel: String
    nativeLanguage: String
    cityOfBirth: String
    ellStatus: String
    compositeLevel: String
    active: Boolean
    designation: String
    countryOfBirth: String
  }
`;

