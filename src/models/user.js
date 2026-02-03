import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';
import isEmail from 'validator/lib/isEmail';

// Password complexity requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Custom password validator
const validatePassword = {
  validator: function (password) {
    // Skip validation if password is already hashed (starts with $2a$ or $2b$)
    if (password.startsWith('$2a$') || password.startsWith('$2b$')) {
      return true;
    }
    // Check minimum length
    if (password.length < PASSWORD_MIN_LENGTH) {
      return false;
    }
    // Check complexity requirements
    return PASSWORD_REGEX.test(password);
  },
  message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters and contain uppercase, lowercase, number, and special character (@$!%*?&)`,
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    maxlength: [254, 'Email cannot exceed 254 characters'],
    validate: [
      isEmail, 'No valid email address provided.',
    ],
  },
  password: {
    type: String,
    required: true,
    maxlength: 120, // Accommodate bcrypt hashes
    validate: validatePassword,
  },
},
{ timestamps: true }
);

// Database indexes for query optimization
// Note: unique: true on email field already creates an index, so we don't need to duplicate it
userSchema.index({ createdAt: -1 }, { background: true }); // For sorted user listings

userSchema.statics.findByLogin = async function (login) {
  const user = await this.findOne({
    email: login,
  });
  return user;
};

userSchema.pre('save', async function () {
  this.password = await this.generatePasswordHash();
});

userSchema.methods.generatePasswordHash = async function () {
  const saltRounds = 12;
  return await bcrypt.hash(this.password, saltRounds);
};

userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
