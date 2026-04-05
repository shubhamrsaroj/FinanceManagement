import { createError } from './errorHandler.js';

// Validation middleware factory function
export const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/"/g, '')
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        req[property] = value;
        next();
    };
};

// Validate MongoDB ObjectId function
export const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw createError(`Invalid ${paramName} format`, 400);
        }

        next();
    };
};