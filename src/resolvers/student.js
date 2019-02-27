import { combineResolvers } from 'graphql-resolvers';
import Student from '../models/student';
import { isAuthenticated } from './authorization';

export default {
  Query: {
    students: combineResolvers(
      isAuthenticated,
      async () => {
        return await Student.find({}).exec()
      },
    ),
    student: combineResolvers(
      isAuthenticated,
      async (parent, args, ctx) => {
        return await ctx.models.Student.findById(id).exec()
      }),
  },

    Mutation: {
      updateStudent: combineResolvers(
        isAuthenticated,
        async (parent, args, ctx) => {
          const { id, data } = args;

          return ctx.models.Student.findById((id) =>
            Student.id === id);

          if (!Student.id) {
            throw new Error('Student not found');
          }

          if (typeof data.fullName === 'string') {
            Student.fullName = data.fullName;
          }

          if (typeof data.school === 'string') {
            Student.school = data.school;
          }

          if (typeof data.teacher === 'string') {
            Student.teacher = data.teacher;
          }

          if (typeof data.gradeLevel === 'string') {
            Student.gradeLevel = data.gradeLevel;
          }

          if (typeof data.ellStatus === 'string') {
            Student.ellStatus = data.ellStatus;
          }

          if (typeof data.compositeLevel === 'string') {
            Student.compositeLevel = data.compositeLevel;
          }

          if (typeof data.designation === 'string') {
            Student.designation = data.designation;
          }

          if (typeof data.nativeLanguage === 'string') {
            Student.nativeLanguage = data.nativeLanguage;
          }

          if (typeof data.countryOfBirth === 'string') {
            Student.countryOfBirth = data.countryOfBirth;
          }
          return Student;
        }),

      deleteStudent: combineResolvers(
        isAuthenticated,
        async (parent, { id }, { models }) => {
          const student = await models.Student.findById(_id);
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
        })
    },
  }


