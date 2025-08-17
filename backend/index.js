import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.js';
import appointmentsRoutes from './routes/appointments.js';
import adminRoutes from './routes/admin.js';
import groupRoutes from './routes/groups.js';
import teacherRoutes from './routes/teachers.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Middlewares
app.use(cors({
  origin: (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173']),
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

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
app.use('/api/groups', groupRoutes);
app.use('/api/teachers', teacherRoutes);

// Health
app.get(['/health', '/api/health'], (req, res) => res.json({ ok: true }));

// 404 & error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
