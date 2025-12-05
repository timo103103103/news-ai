/**
 * Server entry file for production and development
 */
import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';

/**
 * Start server with port from environment or default
 */
const PORT = process.env.PORT || 8081;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 =====================================');
  console.log(`✅ Backend server running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/analyze/summary`);
  console.log('');
  console.log('🔑 OpenAI API Key:', process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ MISSING');
  console.log('🌐 Frontend Origin:', process.env.FRONTEND_ORIGIN || 'Not configured');
  console.log('🚀 =====================================');
  console.log('');
});

/**
 * Graceful shutdown handlers
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
