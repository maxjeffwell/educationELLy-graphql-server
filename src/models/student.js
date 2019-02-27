import uuid from 'uuid';
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema ({
	_id: {
		type: String,
		index: { unique: true },
		default: uuid.v4,
	},
	fullName: {
		type: String,
		required: true,
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
