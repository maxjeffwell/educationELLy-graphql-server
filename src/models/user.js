import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';
import isEmail from 'validator/lib/isEmail';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    validate: [
      isEmail, 'No valid email address provided.',
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    maxlength: 120, // Increased to accommodate bcrypt hashes
  },
},
{ timestamps: true }
);

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
