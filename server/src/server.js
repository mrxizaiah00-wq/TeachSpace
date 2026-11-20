import dotenv from 'dotenv';
import app from './app.js';
import { testDatabaseConnection } from './config/db.js';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

async function bootstrap() {
  try {
    await testDatabaseConnection();
    console.log('MySQL connection verified (teachspace_db).');
  } catch (err) {
    console.error('Failed to connect to MySQL database:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`TeachSpace API Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
