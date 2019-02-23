import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema ({
	fullName: {
		type: String,
		required: true
	},
	school: String,
	teacher: String,
	dateOfBirth: String,
	gender: String,
	race: String,
	gradeLevel: String,
	nativeLanguage: String,
	cityOfBirth: String,
	countryOfBirth: String,
	ellStatus: String,
	compositeLevel: String,
	active: String,
	designation: String
});

const Student = mongoose.model('student', studentSchema);

export default Student;
