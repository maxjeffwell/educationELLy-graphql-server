import { gql } from 'apollo-server-express';

export default gql`
    extend type Query {
        student(id: ID): Student!
				students: [Student!]!
    }
		
		extend type Mutation {
			updateStudent(id: ID!, input: UpdateStudentInput!): Student!
		}
		
		type Student  {
        _id: ID
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
		
		input UpdateStudentInput {
			  fullName: String
			  school: String
			  teacher: String
			  gradeLevel: String
			  ellStatus: String
			  compositeLevel: String
			  designation: String
		}
`;

