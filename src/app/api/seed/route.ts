import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting database seeding via API...');
    await seedDatabase();
    console.log('✅ Database seeded successfully via API!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      credentials: {
        customers: [
          { email: 'john@example.com', password: 'password123' },
          { email: 'jane@example.com', password: 'password123' }
        ],
        providers: [
          { email: 'mike@plumbing.com', password: 'password123' },
          { email: 'sarah@electric.com', password: 'password123' },
          { email: 'tom@carpentry.com', password: 'password123' },
          { email: 'lisa@cleaning.com', password: 'password123' }
        ]
      }
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to seed database' },
      { status: 500 }
    );
  }
}
