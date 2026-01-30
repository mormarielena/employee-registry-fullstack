import express from 'express';
import {
  createActivity,
  getActivities
} from '../controllers/activities.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getActivities);
router.post('/', authMiddleware, createActivity);

export default router;
