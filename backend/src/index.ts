import { env } from './config/env.js';
import app from './app.js';

const host = '0.0.0.0';

app.listen(env.PORT, host, () => {
  console.log(`ClawMarket API running on ${host}:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${env.PORT}/api/health`);
});
