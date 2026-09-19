import { createApp } from './app.js';
import { initDatabase } from './db/index.js';

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  try {
    // 1. Initialize Pluggable Database & Seed Data
    console.log('[StoreX] Initializing database...');
    const repo = await initDatabase();
    console.log(`[StoreX] Database ready using '${repo.driverName}' driver.`);

    // 2. Build Express App
    const app = createApp();

    // 3. Start Listening
    const server = app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 StoreX Node.js Backend is running!`);
      console.log(`📍 Endpoint: http://localhost:${PORT}`);
      console.log(`🩺 Health:   http://localhost:${PORT}/health`);
      console.log(`🔀 DB Driver: ${repo.driverName}`);
      console.log(`=============================================`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('\n[StoreX] Gracefully shutting down...');
      server.close(() => {
        console.log('[StoreX] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[StoreX] Fatal error during bootstrap:', err);
    process.exit(1);
  }
}

bootstrap();
