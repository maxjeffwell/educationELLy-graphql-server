import { gql } from 'apollo-server-express';

export default gql`
    extend type Query {
        student(id: ID!): Student!
				students: [Student!]!
    }
		
		extend type Mutation {
			updateStudent(input: UpdateStudentInput!): Student!
		}
		
		input UpdateStudentInput {
			fullname: String
			school: String
			teacher: String
			gradeLevel: String
			ellStatus: String
			compositeLevel: String
			active: Boolean
			designation: String
		}
    
    type Student  {
        id: ID!
        fullName: String!
		    school: String
		    studentId: String
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
    }
`;

