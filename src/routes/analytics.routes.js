import express from 'express';
import {
  getDashboardSummary,
  getSpendingInsights,
  getComparativeAnalysis
} from '../controller/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboardSummary);
router.get('/insights', authorize('analyst', 'admin'), getSpendingInsights);
router.get('/comparison', authorize('analyst', 'admin'), getComparativeAnalysis);

export default router;