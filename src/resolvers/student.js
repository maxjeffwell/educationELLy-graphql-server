import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from './authorization';
import { studentService } from '../services';
import { withErrorHandling } from '../utils/graphqlErrors';

// Enum mappings between GraphQL values and database strings
const ELL_STATUS_MAP = {
  ACTIVE_ELL: 'Active ELL',
  EXITED: 'Exited',
  MONITORING: 'Monitoring',
  NEVER_ELL: 'Never ELL',
  REFUSED_SERVICES: 'Refused Services',
};

const COMPOSITE_LEVEL_MAP = {
  BEGINNING: 'Beginning',
  EARLY_INTERMEDIATE: 'Early Intermediate',
  INTERMEDIATE: 'Intermediate',
  EARLY_ADVANCED: 'Early Advanced',
  ADVANCED: 'Advanced',
  PROFICIENT: 'Proficient',
};

// Reverse maps for converting DB values back to GraphQL enums
const ELL_STATUS_REVERSE = Object.fromEntries(
  Object.entries(ELL_STATUS_MAP).map(([k, v]) => [v, k])
);
const COMPOSITE_LEVEL_REVERSE = Object.fromEntries(
  Object.entries(COMPOSITE_LEVEL_MAP).map(([k, v]) => [v, k])
);

// Transform input enum values to database strings
const transformEnumInput = (input) => {
  const transformed = { ...input };
  if (transformed.ellStatus && ELL_STATUS_MAP[transformed.ellStatus]) {
    transformed.ellStatus = ELL_STATUS_MAP[transformed.ellStatus];
  }
  if (transformed.compositeLevel && COMPOSITE_LEVEL_MAP[transformed.compositeLevel]) {
    transformed.compositeLevel = COMPOSITE_LEVEL_MAP[transformed.compositeLevel];
  }
  // designation values (ELL, RFEP, IFEP, EO, TBD) are identical in DB and GraphQL
  return transformed;
};

export default {
  Query: {
    students: combineResolvers(
      isAuthenticated,
      withErrorHandling(
        async (parent, args, { models, timing }) => {
          return timing.time('db-students', 'MongoDB students query', () =>
            studentService.findAll(models)
          );
        }
      )
    ),

    student: combineResolvers(
      isAuthenticated,
      withErrorHandling(
        async (parent, { _id }, { models, timing }) => {
          return timing.time('db-student', 'MongoDB student lookup', () =>
            studentService.findById(_id, models)
          );
        }
      )
    ),
  },

  Mutation: {
    createStudent: combineResolvers(
      isAuthenticated,
      withErrorHandling(
        async (parent, { input }, { models }) => {
          const transformedInput = transformEnumInput(input);
          return studentService.create(transformedInput, models);
        }
      )
    ),

    updateStudent: combineResolvers(
      isAuthenticated,
      withErrorHandling(
        async (parent, { _id, input }, { models }) => {
          const transformedInput = transformEnumInput(input);
          return studentService.update(_id, transformedInput, models);
        }
      )
    ),

    deleteStudent: combineResolvers(
      isAuthenticated,
      withErrorHandling(
        async (parent, { _id }, { models }) => {
          return studentService.deleteStudent(_id, models);
        }
      )
    ),
  },

  // Field resolvers to transform DB values to GraphQL enum values
  Student: {
    ellStatus: (student) => {
      if (!student.ellStatus) return null;
      return ELL_STATUS_REVERSE[student.ellStatus] || student.ellStatus;
    },
    compositeLevel: (student) => {
      if (!student.compositeLevel) return null;
      return COMPOSITE_LEVEL_REVERSE[student.compositeLevel] || student.compositeLevel;
    },
    // designation values are identical in DB and GraphQL, no transform needed
  },
};
