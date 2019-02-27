import { combineResolvers } from 'graphql-resolvers';
import Student from '../models/student';
import { isAuthenticated } from './authorization';

export default {
  Query: {
    students: combineResolvers(
      isAuthenticated,
      async () => {
      return await Student.find({})
        .lean()
        .exec()
      },
    ),
    student: async(parent, args, ctx) => {
      return await ctx.models.Student.findById(args.id.toString())
        .lean()
        .exec()
      },
  },
  Mutation: {
    updateStudent: combineResolvers(
      isAuthenticated,
      async (parent, args, ctx) => {
      const update = args.input;
      return await ctx.models.Student.findByIdAndUpdate(args, update, { new: true })
        .lean()
        .exec()
      },
    ),
    deleteStudent: combineResolvers(
      isAuthenticated,
      async (parent, args, { models }) => {
        const student = await models.Student.findById(args.id.toString());
        if (student) {
          await student.remove();
          return true;
        } else {
          return false;
        }
      },
    ),
    createStudent: combineResolvers(
      isAuthenticated,
      async (parent, args, ctx) => {
        console.log(JSON.stringify(args.input, null, 2));
        return await ctx.models.Student.create(args.input);
      }
    )
  }
}
