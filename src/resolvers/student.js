import Student from '../models/student';

export default {
  Query: {
    students: async () => {
      return await Student.find({})
        .lean()
        .exec()
    },
    student: async(parent, args, { models }) => {
      return await models.Student.findById(args.id)
        .lean()
        .exec()
    },
  },
  Mutation: {
    updateStudent: async (parent, args, ctx) => {
      const update = args.input;
      return await Student.findByIdAndUpdate(args.id, update, { new: true })
        .lean()
        .exec()
    }
  }
}
