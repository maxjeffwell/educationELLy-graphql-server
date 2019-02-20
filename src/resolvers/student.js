import Student from '../models/student';

export default {
  Query: {
    students: async(parent, args, {models}) => {
      return await Student.find();
    }
  }
}
