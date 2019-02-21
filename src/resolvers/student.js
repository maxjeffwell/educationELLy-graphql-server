import Student from '../models/student';

export default {
  Query: {
    students: async () => {
      return await Student.find({})
        .lean()
        .exec()
    },
    student: async(root, args) => {
      return await Student.findById(args.id)
        .lean()
        .exec()
    }
  },
  Mutation: {
    updateStudent: async (root, args) => {
      const update = args.input;
      return await Student.findByIdAndUpdate(args.id, update, { new: true })
        .lean()
        .exec()
    }
  }
}
