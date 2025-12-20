import { DateTimeResolver } from 'graphql-scalars';

import userResolvers from './user';
import studentResolvers from './student';
import aiResolvers from './ai';

const customScalarResolver = {
  Date: DateTimeResolver,
};

export default [
  customScalarResolver,
  userResolvers,
  studentResolvers,
  aiResolvers,
];
