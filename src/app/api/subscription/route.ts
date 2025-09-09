import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import ServiceProvider from '@/models/ServiceProvider';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find the service provider for this user
    const provider = await ServiceProvider.findOne({ userId: session.user.id });
    console.log('GET subscription - Found provider:', provider?._id, 'subscriptionStatus:', provider?.subscriptionStatus);

    if (!provider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 });
    }

    const subscription = await Subscription.findOne({ providerId: provider._id })
      .populate('providerId');

    console.log('GET subscription - Found subscription:', subscription?._id, 'status:', subscription?.status);

    return NextResponse.json(subscription || null);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { plan, duration } = await request.json(); // duration in months

    // Find the service provider for this user
    const provider = await ServiceProvider.findOne({ userId: session.user.id });
    if (!provider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 });
    }

    // Check if subscription already exists
    let subscription = await Subscription.findOne({ providerId: provider._id });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration);

    if (subscription) {
      // Update existing subscription
      subscription.plan = plan;
      subscription.status = 'active';
      subscription.endDate = endDate;
      subscription.updatedAt = new Date();
      await subscription.save();
    } else {
      // Create new subscription
      subscription = new Subscription({
        providerId: provider._id,
        plan,
        status: 'active',
        endDate,
      });
      await subscription.save();
    }

    // Update provider's subscription status
    provider.subscriptionStatus = 'active';
    provider.subscriptionId = subscription._id;
    await provider.save();

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { action } = await request.json(); // 'cancel', 'renew'

    // Find the service provider for this user
    const provider = await ServiceProvider.findOne({ userId: session.user.id });
    if (!provider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 });
    }

    const subscription = await Subscription.findOne({ providerId: provider._id });
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (action === 'cancel') {
      subscription.status = 'inactive';
      subscription.autoRenew = false;
      provider.subscriptionStatus = 'inactive';
    } else if (action === 'renew') {
      const endDate = new Date(subscription.endDate);
      endDate.setMonth(endDate.getMonth() + 1); // Extend by 1 month
      subscription.endDate = endDate;
      subscription.status = 'active';
      provider.subscriptionStatus = 'active';
    }

    subscription.updatedAt = new Date();
    await subscription.save();
    await provider.save();

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
