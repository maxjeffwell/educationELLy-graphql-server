import { gql } from 'apollo-server-express';

export default gql`
    extend type Query {
        student(id: ID!): Student!
				students: [Student!]!
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

