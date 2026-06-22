import './config/env'; // Validate env vars first
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const PORT = parseInt(env.PORT, 10);

async function bootstrap() {
  try {
    // Test DB connection
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

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
