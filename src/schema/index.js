import { gql } from 'apollo-server-express';

import userSchema from './user';
import studentSchema from './student';

const linkSchema = gql`
  scalar Date

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

export default [linkSchema, userSchema, studentSchema];
