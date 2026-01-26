import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import driveRoutes from './routes/driveRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';

dotenv.config();

const app = express();

// Check email configuration on startup
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('⚠️  WARNING: Email service not configured!');
  console.warn('   Set EMAIL_USER and EMAIL_PASSWORD in .env file to enable email notifications.');
  console.warn('   See EMAIL_SETUP.md for instructions on setting up Gmail App Password.');
} else {
  console.log('✅ Email service configured');
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/coordinators', coordinatorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/certificates', certificateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Placement Portal API is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

