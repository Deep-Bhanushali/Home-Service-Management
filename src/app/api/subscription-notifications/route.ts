import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  checkExpiringSubscriptions,
  checkExpiredSubscriptions,
  getProviderSubscriptionNotifications,
  markSubscriptionNotificationAsRead
} from '@/lib/subscription-notifications';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the provider for this user
    const { default: ServiceProvider } = await import('@/models/ServiceProvider');
    const { default: dbConnect } = await import('@/lib/db');

    await dbConnect();
    const provider = await ServiceProvider.findOne({ userId: session.user.id });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const notifications = await getProviderSubscriptionNotifications(provider._id.toString());

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching subscription notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'check-expiring') {
      // Admin/system action to check for expiring subscriptions
      if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const notifications = await checkExpiringSubscriptions();
      return NextResponse.json({
        message: `Checked expiring subscriptions. Created ${notifications.length} notifications.`,
        notifications
      });

    } else if (action === 'check-expired') {
      // Admin/system action to check for expired subscriptions
      if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const notifications = await checkExpiredSubscriptions();
      return NextResponse.json({
        message: `Checked expired subscriptions. Created ${notifications.length} notifications.`,
        notifications
      });

    } else if (action === 'mark-read') {
      const { notificationId } = await request.json();

      if (!notificationId) {
        return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
      }

      const notification = await markSubscriptionNotificationAsRead(notificationId, session.user.id);

      if (!notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Notification marked as read', notification });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in subscription notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
