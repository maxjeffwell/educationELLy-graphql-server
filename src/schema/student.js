import { gql } from 'graphql-tag';

export default gql`
    extend type Query {
        student(_id: ID!): Student
				students: [Student]!
    }
		
		extend type Mutation {
			updateStudent(input: UpdateStudentInput!): Student!
			deleteStudent(_id: ID!): Student!
			createStudent(input: NewStudentInput!): Student!
		}
		
		type Student  {
        _id: ID!
        fullName: String
		    school: String
		    teacher: String
		    dateOfBirth: String
		    gender: String
		    race: String
		    gradeLevel: String
		    nativeLanguage: String
		    cityOfBirth: String
		    ellStatus: String
		    compositeLevel: String
		    active: String
		    designation: String
        countryOfBirth: String
				createdAt: Date
				updatedAt: Date
    }
    
    input UpdateStudentInput {
			  fullName: String
			  school: String
			  teacher: String
			  gradeLevel: String
			  ellStatus: String
			  compositeLevel: String
			  designation: String
				updatedAt: Date
		}
    
    input NewStudentInput {
				fullName: String!
				school: String
				teacher: String
				gradeLevel: String
				nativeLanguage: String
				ellStatus: String
				compositeLevel: String
				designation: String
				countryOfBirth: String
				createdAt: Date
    }
`;

