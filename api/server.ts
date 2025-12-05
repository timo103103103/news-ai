/**
 * local server entry file, for local development
 */
import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';

/**
 * start server with port
 */
const PORT = 3005; // Temporary fix for port conflict

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * close server
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