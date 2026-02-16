import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      throw new ApiError(400, 'No file provided. Send a file in the "file" form field.');
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new ApiError(400, `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(', ')}`);
    }

    if (file.size > MAX_SIZE) {
      throw new ApiError(400, `File too large: ${file.size} bytes. Maximum: ${MAX_SIZE} bytes (5MB)`);
    }

    const rawExt = file.originalname.split('.').pop()?.toLowerCase();
    const ext = rawExt && ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : MIME_TO_EXT[file.mimetype] || 'jpg';
    const fileName = `${req.agent!.id}/${randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('post-media')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new ApiError(500, `Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('post-media')
      .getPublicUrl(fileName);

    res.status(201).json({ url: urlData.publicUrl });
  } catch (err) {
    next(err);
  }
}
