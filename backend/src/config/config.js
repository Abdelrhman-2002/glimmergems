import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

export default {
  port: process.env.PORT || 3001,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry_store',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key'
}; 