import './config/env'; // Validate env vars first
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const PORT = parseInt(env.PORT, 10);

async function bootstrap() {
  if (process.env.VERCEL) {
    // Vercel serverless environment: just ensure DB client is initialized
    return;
  }

  try {
    // Local environment: Test DB connection and start listening
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   CORS Origin: ${env.CORS_ORIGIN}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

// Export the app for Vercel Serverless Functions
export default app;

// Graceful shutdown (only for persistent servers, not Vercel)
if (!process.env.VERCEL) {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
