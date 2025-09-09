import { NextRequest, NextResponse } from 'next/server';
import { checkExpiringSubscriptions, checkExpiredSubscriptions } from '@/lib/subscription-notifications';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (optional security)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting subscription notification cron job...');

    const startTime = Date.now();

    // Run notification checks
    console.log('📅 Checking for expiring subscriptions...');
    const expiringNotifications = await checkExpiringSubscriptions();

    console.log('⏰ Checking for expired subscriptions...');
    const expiredNotifications = await checkExpiredSubscriptions();

    const endTime = Date.now();
    const duration = endTime - startTime;

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      expiringNotifications: {
        count: expiringNotifications.length,
        notifications: expiringNotifications
      },
      expiredNotifications: {
        count: expiredNotifications.length,
        notifications: expiredNotifications
      },
      totalNotifications: expiringNotifications.length + expiredNotifications.length
    };

    console.log('✅ Cron job completed successfully');
    console.log(`📊 Created ${result.totalNotifications} notifications in ${duration}ms`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Cron job failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
