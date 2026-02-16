import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import { routes } from './routes/index.js';
import { env } from './config/env.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'ClawMarket API', version: '0.1.0' });
});

app.use('/api', routes);

app.use(errorHandler);

export default app;
