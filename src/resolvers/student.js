import { combineResolvers } from 'graphql-resolvers';
import { GraphQLError } from 'graphql';
import { isAuthenticated } from './authorization';

// Helper to convert Mongoose validation errors to GraphQL errors
const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors)
      .map((e) => e.message)
      .join('. ');
    throw new GraphQLError(messages, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  if (error.name === 'CastError') {
    throw new GraphQLError('Invalid student ID format', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  throw error;
};

export default {
  Query: {
    students: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, timing }) => {
        return timing.time('db-students', 'MongoDB students query', () =>
          models.Student.find({})
        );
      }
    ),
    student: combineResolvers(
      isAuthenticated,
      async (parent, { _id }, { models, timing }) => {
        return timing.time('db-student', 'MongoDB student lookup', () =>
          models.Student.findById(_id)
        );
      }
    ),
  },

  Mutation: {
    createStudent: combineResolvers(
      isAuthenticated,
      async (parent, { input }, { models }) => {
        try {
          return await models.Student.create(input);
        } catch (error) {
          handleValidationError(error);
        }
      }
    ),

    updateStudent: combineResolvers(
      isAuthenticated,
      async (parent, { _id, input }, { models }) => {
        try {
          // Filter out null and undefined values
          const filteredInput = Object.fromEntries(
            Object.entries(input).filter(
              ([, value]) => value !== null && value !== undefined
            )
          );

          const student = await models.Student.findByIdAndUpdate(
            _id,
            { $set: filteredInput },
            { new: true, runValidators: true }
          );

          if (!student) {
            throw new GraphQLError('Student not found', {
              extensions: { code: 'NOT_FOUND' },
            });
          }

          return student;
        } catch (error) {
          if (error instanceof GraphQLError) throw error;
          handleValidationError(error);
        }
      }
    ),

    deleteStudent: combineResolvers(
      isAuthenticated,
      async (parent, { _id }, { models }) => {
        try {
          // Validate ObjectId format first
          if (!_id || !_id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new GraphQLError('Invalid student ID format', {
              extensions: { code: 'BAD_USER_INPUT' },
            });
          }

          const student = await models.Student.findById(_id);

          if (!student) {
            throw new GraphQLError('Student not found', {
              extensions: { code: 'NOT_FOUND' },
            });
          }

          await models.Student.findOneAndDelete({ _id });
          return true;
        } catch (error) {
          if (error instanceof GraphQLError) throw error;
          handleValidationError(error);
        }
      }
    ),
  },
};

