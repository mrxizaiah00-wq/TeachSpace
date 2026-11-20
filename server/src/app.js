import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { requireCsrf } from './middleware/csrfMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import classRoutes from './routes/classRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan login/registrasi. Coba lagi beberapa saat.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan API.' },
});

const avatarsPath = path.resolve(process.cwd(), 'uploads/avatars');
if (!fs.existsSync(avatarsPath)) fs.mkdirSync(avatarsPath, { recursive: true });
app.use('/uploads/avatars', express.static(avatarsPath));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', app: 'TeachSpace' });
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1', apiLimiter, requireCsrf);

app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', settingsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/grades', assessmentRoutes);
app.use('/api/v1/materials', materialRoutes);
app.use('/api/v1/reports', reportRoutes);

app.use(errorHandler);

export default app;
