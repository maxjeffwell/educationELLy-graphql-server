import mongoose from 'mongoose';

// Valid enum values for controlled fields
const GRADE_LEVELS = [
  'Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
];
const ELL_STATUSES = [
  'Active ELL', 'Exited', 'Monitoring', 'Never ELL', 'Refused Services',
];
const COMPOSITE_LEVELS = [
  'Beginning', 'Early Intermediate', 'Intermediate',
  'Early Advanced', 'Advanced', 'Proficient',
];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
const DESIGNATIONS = ['ELL', 'RFEP', 'IFEP', 'EO', 'TBD'];

// Max lengths for string fields
const MAX_NAME_LENGTH = 100;
const MAX_SCHOOL_LENGTH = 150;
const MAX_LOCATION_LENGTH = 100;
const MAX_LANGUAGE_LENGTH = 50;
const MAX_GENERAL_LENGTH = 100;

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [MAX_NAME_LENGTH, `Name cannot exceed ${MAX_NAME_LENGTH} characters`],
  },
  school: {
    type: String,
    trim: true,
    maxlength: [MAX_SCHOOL_LENGTH, `School name cannot exceed ${MAX_SCHOOL_LENGTH} characters`],
  },
  teacher: {
    type: String,
    trim: true,
    maxlength: [MAX_NAME_LENGTH, `Teacher name cannot exceed ${MAX_NAME_LENGTH} characters`],
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function (date) {
        if (!date) return true; // Optional field
        const now = new Date();
        const minDate = new Date('1900-01-01');
        return date >= minDate && date <= now;
      },
      message: 'Date of birth must be between 1900 and today',
    },
  },
  gender: {
    type: String,
    trim: true,
    enum: {
      values: GENDERS,
      message: `Gender must be one of: ${GENDERS.join(', ')}`,
    },
  },
  race: {
    type: String,
    trim: true,
    maxlength: [MAX_GENERAL_LENGTH, `Race cannot exceed ${MAX_GENERAL_LENGTH} characters`],
  },
  gradeLevel: {
    type: String,
    trim: true,
    enum: {
      values: GRADE_LEVELS,
      message: `Grade level must be one of: ${GRADE_LEVELS.join(', ')}`,
    },
  },
  nativeLanguage: {
    type: String,
    trim: true,
    maxlength: [MAX_LANGUAGE_LENGTH, `Language cannot exceed ${MAX_LANGUAGE_LENGTH} characters`],
  },
  cityOfBirth: {
    type: String,
    trim: true,
    maxlength: [MAX_LOCATION_LENGTH, `City cannot exceed ${MAX_LOCATION_LENGTH} characters`],
  },
  countryOfBirth: {
    type: String,
    trim: true,
    maxlength: [MAX_LOCATION_LENGTH, `Country cannot exceed ${MAX_LOCATION_LENGTH} characters`],
  },
  ellStatus: {
    type: String,
    trim: true,
    enum: {
      values: ELL_STATUSES,
      message: `ELL status must be one of: ${ELL_STATUSES.join(', ')}`,
    },
  },
  compositeLevel: {
    type: String,
    trim: true,
    enum: {
      values: COMPOSITE_LEVELS,
      message: `Composite level must be one of: ${COMPOSITE_LEVELS.join(', ')}`,
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
  designation: {
    type: String,
    trim: true,
    enum: {
      values: DESIGNATIONS,
      message: `Designation must be one of: ${DESIGNATIONS.join(', ')}`,
    },
  },
}, {
  timestamps: true,
});

// Database indexes for query optimization
// Single-field indexes for common filters
studentSchema.index({ createdAt: -1 }, { background: true }); // Sorted listings (newest first)
studentSchema.index({ school: 1 }, { background: true }); // Filter by school
studentSchema.index({ gradeLevel: 1 }, { background: true }); // Filter by grade
studentSchema.index({ ellStatus: 1 }, { background: true }); // Filter by ELL status
studentSchema.index({ active: 1 }, { background: true }); // Filter active/inactive

// Compound indexes for common query patterns
studentSchema.index({ school: 1, gradeLevel: 1 }, { background: true }); // School + grade filter
studentSchema.index({ active: 1, ellStatus: 1 }, { background: true }); // Active ELL students
studentSchema.index({ school: 1, active: 1, createdAt: -1 }, { background: true }); // Active students by school, sorted

// Text index for full-text search on student names
studentSchema.index({ fullName: 'text' }, { background: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;
