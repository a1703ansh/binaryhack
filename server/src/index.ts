import { app } from './app.js';
import { env } from './env.js';
import { prisma } from './db.js';

async function main() {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`⚡ EarnWise API listening on http://localhost:${env.port}`);
    console.log(`   CORS origin: ${env.clientOrigin}`);
    console.log(`   Copilot: ${env.groqApiKey ? `Groq (${env.groqModel})` : 'rule-based (set GROQ_API_KEY for LLM)'}`);
  });
}

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});