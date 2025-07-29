import { combineResolvers } from 'graphql-resolvers';
import Student from '../models/student';
import { isAuthenticated } from './authorization';

export default {
  Query: {
    students: combineResolvers(
      isAuthenticated,
      async (parent, args, { models }) => await models.Student.find({}).exec()
    ),
    student: combineResolvers(
      isAuthenticated,
      async (parent, { _id }, { models }) => await models.Student.findById(_id).exec()),
  },

  Mutation: {
    updateStudent: combineResolvers(
      isAuthenticated,
      async (parent, { _id, input }, { models }) => {
        const student = await models.Student.findByIdAndUpdate(
          _id,
          { $set: input },
          { new: true, runValidators: true }
        );

        if (!student) {
          throw new Error('Student not found');
        }

        return student;
      }),

    deleteStudent: combineResolvers(
      isAuthenticated,
      async (parent, { _id }, { models }) => {
        const deletedStudent = await models.Student.findOneAndDelete({ _id }).exec();
        return !!deletedStudent;
      }
    ),

    createStudent: combineResolvers(
      isAuthenticated,
      async (parent, args, { models }) => await models.Student.create(args.input)),
  },
};

