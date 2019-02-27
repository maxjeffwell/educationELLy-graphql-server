import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    users: [User!]  
    user(_id: String!): User
    me: User!
  }

  extend type Mutation {
      signUp(email: String!, password: String!): Token!
      signIn(login: String!, password: String!): Token!
  }

  type Token {
    token: String!
  }

  type User {
      _id: ID!
      email: String
      createdAt: Date
      username: String
  }
`;
