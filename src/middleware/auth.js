import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, createError } from './errorHandler.js';
import config from '../config/env.js';

// Authenticate user function
export const authenticate = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw createError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
        throw createError('User belonging to this token no longer exists.', 401);
    }

    if (!user.isActive) {
        throw createError('Your account has been deactivated. Contact admin.', 401);
    }

    req.user = user;
    next();
});

// Authorize roles function
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw createError(
                `Role '${req.user.role}' is not authorized to access this route`,
                403
            );
        }
        next();
    };
};