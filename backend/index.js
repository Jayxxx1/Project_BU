import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.js';
import appointmentsRoutes from './routes/appointments.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import adminRoutes from './routes/admin.js';
import groupRoutes from './routes/groups.js';
import teacherRoutes from './routes/teachers.js';

const app = express();

// CORS
const allow = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());
app.use(cors({ origin: allow, credentials: true }));

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// MongoDB
const MONGO = process.env.ATLAS_URI;
if (!MONGO) {
  console.error('ATLAS_URI is missing in .env');
  process.exit(1);
}
mongoose.set('strictQuery', true);
mongoose
  .connect(MONGO)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });

// ROUTES 
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);

app.use('api/admin',adminRoutes)
app.use('api/groups',groupRoutes)
app.use('api/teachers',teacherRoutes)

app.get(['/health', '/api/health'], (req, res) => res.json({ ok: true }));


// 404 & ERROR HANDLERS (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
