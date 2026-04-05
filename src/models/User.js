import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { ROLES } from '../config/constants.js';


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']

  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.VIEWER
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});


userSchema.pre('save', async function (next) {

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();

});

userSchema.methods.comparePassword = async function (candidatePassword) {

  return await bcrypt.compare(candidatePassword, this.password);
}


userSchema.methods.generateAuthToken = function () {

  return jwt.sign(

    { id: this._id, role: this.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }

  )

}

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;

