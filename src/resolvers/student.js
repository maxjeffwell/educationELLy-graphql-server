import { combineResolvers } from 'graphql-resolvers';
import Student from '../models/student';
import { isAuthenticated } from './authorization';

export default {
  Query: {
    students: combineResolvers(
      isAuthenticated,
      async () => await Student.find({}).exec()
    ),
    student: combineResolvers(
      isAuthenticated,
      async (parent, { _id }, ctx) => await ctx.models.Student.findById(_id).exec()),
  },

  Mutation: {
    updateStudent: combineResolvers(
      isAuthenticated,
      async (parent, { _id, input }, ctx) => {
        const student = await ctx.models.Student.findByIdAndUpdate(
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
      async (parent, args, ctx) => await ctx.models.Student.create(args.input)),
  },
};

