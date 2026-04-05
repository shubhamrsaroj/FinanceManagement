import express from 'express';
import {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getCategories
} from '../controller/recordController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';
import { validate, validateObjectId } from '../middleware/validation.js';
import { createLimiter } from '../middleware/rateLimiter.js';
import {
  createRecordSchema,
  updateRecordSchema,
  queryRecordsSchema
} from '../validators/recordValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/categories', getCategories);

router.post(
  '/',
  checkPermission('financialRecords', 'create'),
  createLimiter,
  validate(createRecordSchema),
  createRecord
);

router.get(
  '/',
  checkPermission('financialRecords', 'read'),
  validate(queryRecordsSchema, 'query'),
  getRecords
);

router.get(
  '/:id',
  checkPermission('financialRecords', 'read'),
  validateObjectId('id'),
  getRecord
);

router.patch(
  '/:id',
  checkPermission('financialRecords', 'update'),
  validateObjectId('id'),
  validate(updateRecordSchema),
  updateRecord
);

router.delete(
  '/:id',
  checkPermission('financialRecords', 'delete'),
  validateObjectId('id'),
  deleteRecord
);

export default router;