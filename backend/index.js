import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

//  สร้าง __dirname สำหรับ ES modules 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลดไฟล์ ENV: backend/server/config.env 
dotenv.config({ path: path.join(__dirname, 'server', 'config.env') });


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import appointmentsRoutes from './routes/appointments.js';
import adminRoutes from './routes/admin.js';
import teacherRoutes from './routes/teachers.js';
import projectRoutes from './routes/projects.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Middlewares
app.use(cors({
  origin: (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173']),
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// debug
// console.log('[ENV CHECK] MAIL_HOST=', process.env.MAIL_HOST);
// console.log('[ENV CHECK] MAIL_USER=', process.env.MAIL_USER);
// console.log('[ENV CHECK] MAIL_PORT=', process.env.MAIL_PORT, ' FROM=', process.env.MAIL_FROM, ' PASS?', !!process.env.MAIL_PASS);

// DB connect
const MONGO_URI = process.env.ATLAS_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('No Mongo URI provided. Set ATLAS_URI or MONGO_URI in .env');
  process.exit(1);
}
mongoose.connect(MONGO_URI)
  .then(() => console.log(' MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/projects', projectRoutes);

// Health
app.get(['/health', '/api/health'], (req, res) => res.json({ ok: true }));

// 404 & error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
