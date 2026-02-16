import { env } from './config/env.js';
import app from './app.js';

app.listen(env.PORT, () => {
  console.log(`ClawMarket API running on port ${env.PORT}`);
  console.log(`Health check: http://localhost:${env.PORT}/api/health`);
});
