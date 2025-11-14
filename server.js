const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: './.env' });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leadRoutes = require('./routes/leads');
const leadResponseRoutes = require('./routes/leadResponses');
const departmentRoutes = require('./routes/departments');
const sectionRoutes = require('./routes/sections');
const programRoutes = require('./routes/programs');
const roleRoutes = require('./routes/roles');
const permissionRoutes = require('./routes/permissions');
const inboxRoutes = require('./routes/inbox');
const provinceRoutes = require('./routes/provinces');
const districtRoutes = require('./routes/districts');
const madarisRoutes = require('./routes/madarisRoutes');
const schoolOfThoughtRoutes = require('./routes/schoolOfThoughtRoutes');
const madarisTeacherRoutes = require('./routes/madarisTeacherRoutes');
const madarisStudentsRoutes = require('./routes/madarisStudentsRoutes');
const countryRoutes = require('./routes/luCountryRoutes');
const madarisTeachingVocationalSkillRoutes = require('./routes/madarisTeachingVocationalSkillRoutes');
const madarisTeachersSupportHighEducationRoutes = require('./routes/madarisTeachersSupportHighEducationRoutes');
const madarisModelInternationalStandardRoutes = require('./routes/madarisModelInternationalStandardRoutes');
const madarisBankAccountRoutes = require('./routes/madarisBankAccountRoutes');
const madarisMeetingHeldRoutes = require('./routes/madarisMeetingHeldRoutes');
const madarisSubjectCurriculumRoutes = require('./routes/madarisSubjectCurriculumRoutes');
const madarisSubjectUpdateCurriculumRoutes = require('./routes/madarisSubjectUpdateCurriculumRoutes');
const madarisCurriculumRoutes = require('./routes/madarisCurriculumRoutes');
const madarisCurriculumSubjectAssignmentRoutes = require('./routes/madarisCurriculumSubjectAssignmentRoutes');
const madarisMadarisCurriculumAssignmentRoutes = require('./routes/madarisMadarisCurriculumAssignmentRoutes');
const madarisNonCooperativeRoutes = require('./routes/madarisNonCooperativeRoutes');
const madarisIllegalActionRoutes = require('./routes/madarisIllegalActionRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000" || "http://192.168.103.43:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Remove Socket.io middleware

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/leads', leadResponseRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/all-provinces', provinceRoutes);
app.use('/api/all-districts', districtRoutes);
// Mount madarisTeacherRoutes before madarisRoutes to prevent route conflicts
app.use('/api/madaris', madarisTeacherRoutes);
app.use('/api/madaris', madarisStudentsRoutes);
app.use('/api', madarisRoutes);
app.use('/api/all-school-of-thoughts', schoolOfThoughtRoutes);
app.use('/api/all-countries', countryRoutes);
app.use('/api/madaris', madarisTeachingVocationalSkillRoutes);
app.use('/api/madaris', madarisTeachersSupportHighEducationRoutes);
app.use('/api/madaris', madarisModelInternationalStandardRoutes);
app.use('/api/madaris', madarisBankAccountRoutes);
app.use('/api/madaris', madarisMeetingHeldRoutes);
app.use('/api/madaris', madarisSubjectCurriculumRoutes);
app.use('/api/madaris', madarisSubjectUpdateCurriculumRoutes);
app.use('/api/madaris', madarisCurriculumRoutes);
app.use('/api/madaris', madarisCurriculumSubjectAssignmentRoutes);
app.use('/api/madaris', madarisMadarisCurriculumAssignmentRoutes);
app.use('/api/madaris', madarisNonCooperativeRoutes);
app.use('/api/madaris', madarisIllegalActionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'APIs are running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Socket.io removed - using polling instead

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });

  // Configure server timeouts and connection limits
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.maxConnections = 1000;
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

module.exports = { app };
