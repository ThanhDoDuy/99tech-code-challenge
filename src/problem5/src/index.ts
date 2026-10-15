import { createApp } from './app';
import { config } from './config';
import { runMigrations } from './migrate';

// Ensure the schema is up to date before serving traffic.
runMigrations();

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 CRUD server listening on http://localhost:${config.port}`);
  console.log(`   Resources API: http://localhost:${config.port}/resources`);
});
