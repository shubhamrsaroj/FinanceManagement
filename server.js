import app from './src/app.js';
import connectDb from './src/config/database.js';
import config from './src/config/env.js';

const startServer = async () => {
  try {
    await connectDb();

    app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🚀 Finance Dashboard API                ║
║   Environment: ${config.nodeEnv.padEnd(28)}║
║   Port: ${String(config.port).padEnd(35)}║
║   URL: <http://localhost>:${config.port}${' '.repeat(19)}║
╚════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();