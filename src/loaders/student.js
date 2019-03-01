export const batchStudents = async (keys, models) => {
  const students = await models.Student.find({
    _id: {
      $in: keys,
    },
  });

  return keys.map(key => students.find(student => student.id === key));
};
