import { Router } from 'express';
import multer from 'multer';
import { upload } from '../controllers/upload.controller.js';
import { requireAuth } from '../middleware/auth.js';

const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadRoutes = Router();

uploadRoutes.post('/', requireAuth, uploadMiddleware.single('file'), upload);
