import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
// import appointmentsRoutes from './routes/appointmentsRoutes.js';


dotenv.config({ path: path.resolve('./.env') });

// เชื่อม MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.ATLAS_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
// app.use('/api/appointments', appointmentsRoutes);

app.use(cors({ origin: process.env.CORS_ORIGIN }));


// Routes
app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);
app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('API is running...'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

