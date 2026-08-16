import app from './app';
import { connectDatabase } from './config/database';
import { ENV } from './config/env';
import { User } from './models/User';
import { seedDatabase } from './seed';

const startServer = async () => {
  try {
    await connectDatabase();

    // Check if initial seeding is needed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 [ADEXA AI] Empty database detected. Running initial demo seed...');
      await seedDatabase();
    }

    const port = Number(ENV.PORT) || 5000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 ADEXA AI Backend API running on port ${port}`);
      console.log(`📡 URL: http://0.0.0.0:${port}`);
      console.log(`🧠 AI Service URL: ${ENV.AI_SERVICE_URL}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start ADEXA server:', error);
    process.exit(1);
  }
};

startServer();
