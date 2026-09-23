import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Request } from 'express';
import multer from 'multer';

const here = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(here, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, _file, cb) => {
    const userId = (req as Request & { userId?: string }).userId ?? 'anon';
    cb(null, `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`);
  }
});

export const uploadReceipt = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPEG, or WEBP images are allowed'));
    }
  }
});