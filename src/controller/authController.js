import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { createError, asyncHandler } from "../middleware/errorHandler.js";


export const register = asyncHandler(async (req, res) => {


  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createError('Email already registered', 400);
  }


  const user = await User.create({
    name, email, password, role: role || 'viewer'
  });

  const accessToken = user.generateAuthToken();

  await AuditLog.create({
    user: user._id,
    action: 'CREATE',
    resource: 'User',
    resourceId: user._id,
    details: { email: user.email }
  })


  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user,
      accessToken
    }
  });

});



export const login = asyncHandler(async (req, res) => {


  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('Account is deactivated. Contact admin.', 401);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw createError('Invalid email or password', 401);
  }

  user.lastLogin = new Date();

  await user.save();

  const accessToken = user.generateAuthToken();

  await AuditLog.create({
    user: user._id,
    action: "LOGIN",
    resource: 'Auth',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });


  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      accessToken
    }
  });

})


export const getMe = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user
  });
})

export const logout = asyncHandler(async (req, res) => {

  await AuditLog.create({

    user: req.user._id,
    action: "LOGOUT",
    resource: "Auth"
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });

});

export const changePassword = asyncHandler(async (req, res) => {

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw createError('Current password is incorrect', 401);
  }

  user.password = newPassword;

  await user.save();

  const accessToken = user.generateAuthToken();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: { accessToken }
  });



})