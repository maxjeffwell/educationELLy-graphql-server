import { combineResolvers } from 'graphql-resolvers';
import Student from '../models/student';
import { isAuthenticated } from './authorization';

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
    updateStudent: combineResolvers(
      isAuthenticated,
      async (parent, { _id, input }, { models }) => {
        try {
          console.log('UpdateStudent called with:', { _id, input });
          
          // Filter out null and undefined values to prevent overwriting required fields
          const filteredInput = Object.fromEntries(
            Object.entries(input).filter(([key, value]) => value !== null && value !== undefined)
          );
          console.log('Filtered input:', filteredInput);

          const student = await models.Student.findByIdAndUpdate(
            _id,
            { $set: filteredInput },
            { new: true, runValidators: true }
          );

          if (!student) {
            console.log('Student not found for ID:', _id);
            throw new Error('Student not found');
          }

          console.log('Student updated successfully:', student._id);
          return student;
        } catch (error) {
          console.error('UpdateStudent error:', error);
          throw error;
        }
      }),

    deleteStudent: combineResolvers(
      isAuthenticated,
      async (parent, { _id }, { models }) => {
        try {
          // Validate ObjectId format first
          if (!_id || !_id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('Invalid student ID format');
          }

          const student = await models.Student.findById(_id);
          
          if (!student) {
            throw new Error('Student not found');
          }
          
          const deletedStudent = await models.Student.findOneAndDelete({ _id }).exec();
          
          if (!deletedStudent) {
            throw new Error('Failed to delete student');
          }
          
          return true;
        } catch (error) {
          console.error('DeleteStudent error:', error);
          
          // Handle Mongoose validation errors
          if (error.name === 'CastError') {
            throw new Error('Invalid student ID format');
          }
          
          if (error.name === 'MongoServerError' && error.code === 66) {
            throw new Error('Cannot delete student: This student has related records that must be deleted first');
          }
          
          if (error.message === 'Student not found' || error.message === 'Invalid student ID format') {
            throw error;
          }
          
          throw new Error(`Failed to delete student: ${error.message}`);
        }
      }
    ),

    createStudent: combineResolvers(
      isAuthenticated,
      async (parent, args, { models }) => await models.Student.create(args.input)),
  },
};

