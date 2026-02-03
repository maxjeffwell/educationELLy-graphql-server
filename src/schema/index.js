import { gql } from 'graphql-tag';

import userSchema from './user';
import studentSchema from './student';
import aiSchema from './ai';

const linkSchema = gql`
  """
  Custom scalar representing a date/time value.
  Serialized as an ISO 8601 date string (e.g., "2024-01-15T10:30:00.000Z").
  """
  scalar Date

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

export default [linkSchema, userSchema, studentSchema, aiSchema];
