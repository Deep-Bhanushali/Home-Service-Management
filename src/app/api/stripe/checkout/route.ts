import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createCheckoutSession } from '@/lib/stripe';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, plan, duration } = await request.json();

    if (!priceId || !plan) {
      return NextResponse.json({ error: 'Price ID and plan are required' }, { status: 400 });
    }

    // Find the service provider for this user to get the correct provider ID
    const { default: ServiceProvider } = await import('@/models/ServiceProvider');
    const { default: dbConnect } = await import('@/lib/db');

    await dbConnect();
    const provider = await ServiceProvider.findOne({ userId: session.user.id });

    if (!provider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 });
    }

    console.log('Creating checkout session for provider:', provider._id, 'user:', session.user.id);

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession(
      priceId,
      session.user.id,
      session.user.email,
      {
        plan,
        duration: duration.toString(),
        providerId: provider._id.toString(), // Use the actual provider ID, not user ID
      }
    );

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
