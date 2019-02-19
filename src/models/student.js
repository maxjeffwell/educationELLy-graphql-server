import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema ({
	fullName: {
		type: String,
		required: true
	},
	school: String,
	studentId: Number,
	teacher: String,
	dateOfBirth: Date,
	gender: String,
	race: String,
	gradeLevel: Number,
	nativeLanguage: String,
	cityOfBirth: String,
	countryOfBirth: String,
	ellStatus: String,
	compositeLevel: String,
	active: Boolean,
	designation: String
});

const Student = mongoose.model('student', studentSchema);

export default Student;
