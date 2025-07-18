import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  school: String,
  teacher: String,
  dateOfBirth: Date,
  gender: String,
  race: String,
  gradeLevel: String,
  nativeLanguage: String,
  cityOfBirth: String,
  countryOfBirth: String,
  ellStatus: String,
  compositeLevel: String,
  active: Boolean,
  designation: String,
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
