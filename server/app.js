import express from 'express';
import cors from 'cors';
import attendanceRoutes from './routes/attendanceRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log Content-Type for attendance endpoints to help debug multipart issues
app.use((req, res, next) => {
  if (req.path.startsWith('/api/attendance')) {
    console.log(`${req.method} ${req.path} - Content-Type:`, req.headers['content-type']);
  }
  next();
});

// Routes
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Face Attendance System API is running!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

export default app;

