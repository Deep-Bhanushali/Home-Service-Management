import { seedDatabase } from '../src/lib/seed.js';

async function runSeed() {
  console.log('🚀 Starting database seeding...');
  await seedDatabase();
  console.log('✅ Seeding completed!');
  process.exit(0);
}

runSeed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
