import express from 'express';
import dotenv from 'dotenv';
import routes from './routes';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enable JSON body parsing for incoming requests
app.use(express.json());

// Register all API routes under /api prefix
app.use('/api', routes);

export default app;
