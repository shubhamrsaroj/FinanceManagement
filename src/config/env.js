import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

dotenv.config({ path: path.join(_dirname, '../../.env') });

// Required secrets — fail fast if missing so bad defaults never reach production
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required. Set it in your .env file.');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Set it in your .env file.');
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
};

export default config;