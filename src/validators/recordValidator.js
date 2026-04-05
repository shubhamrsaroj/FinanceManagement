import Joi from 'joi';
import { RECORD_TYPES } from '../config/constants.js';

export const createRecordSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Amount must be a positive number',
      'any.required': 'Amount is required'
    }),
  type: Joi.string()
    .valid(...Object.values(RECORD_TYPES))
    .required()
    .messages({
      'any.only': 'Type must be either income or expense',
      'any.required': 'Type is required'
    }),
  category: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'any.required': 'Category is required'
    }),
  date: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.max': 'Date cannot be in the future',
      'any.required': 'Date is required'
    }),
  description: Joi.string()
    .max(500)
    .allow('')
    .optional(),
  tags: Joi.array()
    .items(Joi.string().max(30))
    .max(10)
    .optional()
});

export const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  type: Joi.string().valid(...Object.values(RECORD_TYPES)),
  category: Joi.string().min(2).max(50),
  date: Joi.date().max('now'),
  description: Joi.string().max(500).allow(''),
  tags: Joi.array().items(Joi.string().max(30)).max(10)
}).min(1);

export const queryRecordsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('date', 'amount', 'category', 'type', 'createdAt').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  type: Joi.string().valid(...Object.values(RECORD_TYPES)),
  category: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date().min(Joi.ref('startDate')),
  minAmount: Joi.number().min(0),
  maxAmount: Joi.number().min(Joi.ref('minAmount')),
  search: Joi.string().max(100)
});