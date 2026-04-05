// Pure function to create error response
export const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};

// Async wrapper function
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Not found handler function
export const notFoundHandler = (req, res, next) => {
    const error = createError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

// Global error handler function
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    let error = { ...err };
    error.message = err.message;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}`;
        error = createError(message, 400);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate value for field: ${field}`;
        error = createError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        const message = `Validation Error: ${messages.join('. ')}`;
        error = createError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = createError('Invalid token. Please log in again.', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = createError('Token expired. Please log in again.', 401);
    }

    if (process.env.NODE_ENV === 'development') {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
            stack: err.stack,
            error: err
        });
    }

    if (error.isOperational) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    console.error('ERROR 💥:', err);
    return res.status(500).json({
        success: false,
        message: 'Something went wrong'
    });
};