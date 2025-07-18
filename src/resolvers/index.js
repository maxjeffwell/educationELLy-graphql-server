import { DateTimeResolver } from 'graphql-scalars';

import userResolvers from './user';
import studentResolvers from './student';

const customScalarResolver = {
  Date: DateTimeResolver,
};

export default [
  customScalarResolver,
  userResolvers,
  studentResolvers,
];
