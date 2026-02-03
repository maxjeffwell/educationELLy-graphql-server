import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from './authorization';
import { studentService } from '../services';
import { withErrorHandling } from '../utils/graphqlErrors';

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
          return studentService.create(input, models);
        }
      )
    ),

    updateStudent: combineResolvers(
      isAuthenticated,
      withErrorHandling(
        async (parent, { _id, input }, { models }) => {
          return studentService.update(_id, input, models);
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
};
