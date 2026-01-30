import express from 'express';
import {
  fetchDelegatedMembers,
  createDelegatedMember,
  removeDelegatedMember
} from '../controllers/delegatedMembers.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, fetchDelegatedMembers);
router.post('/', authMiddleware, createDelegatedMember);
router.delete('/:id', authMiddleware, removeDelegatedMember);

export default router;
