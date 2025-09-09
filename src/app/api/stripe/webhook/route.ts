import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import ServiceProvider from '@/models/ServiceProvider';
import type { Stripe } from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    await dbConnect();

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata as { userId?: string; plan?: string; duration?: string; providerId?: string };
  const { plan, duration, providerId } = metadata;

  console.log('Processing checkout completion:', { providerId, plan, duration });

  if (!providerId || !plan || !duration) {
    console.error('Missing required metadata:', { providerId, plan, duration });
    return;
  }

  try {
    // Find or create subscription
    let subscription = await Subscription.findOne({ providerId });
    console.log('Found existing subscription:', !!subscription);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(duration));

    if (subscription) {
      subscription.stripeCustomerId = session.customer as string;
      subscription.stripeSubscriptionId = session.subscription as string;
      subscription.status = 'active';
      subscription.endDate = endDate;
      subscription.updatedAt = new Date();
    } else {
      subscription = new Subscription({
        providerId,
        plan,
        status: 'active',
        endDate,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      });
    }

    await subscription.save();
    console.log('Subscription saved:', subscription._id);

    // Update provider
    const provider = await ServiceProvider.findById(providerId);
    console.log('Found provider:', !!provider);

    if (provider) {
      provider.subscriptionStatus = 'active';
      provider.subscriptionId = subscription._id;
      await provider.save();
      console.log('Provider updated with subscription status');
    } else {
      console.error('Provider not found:', providerId);
    }
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const existingSub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (existingSub) {
    existingSub.status = 'active';
    existingSub.updatedAt = new Date();
    await existingSub.save();

    const provider = await ServiceProvider.findById(existingSub.providerId);
    if (provider) {
      provider.subscriptionStatus = 'active';
      await provider.save();
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const existingSub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (existingSub) {
    existingSub.status = subscription.status === 'active' ? 'active' : 'inactive';
    existingSub.updatedAt = new Date();
    await existingSub.save();

    const provider = await ServiceProvider.findById(existingSub.providerId);
    if (provider) {
      provider.subscriptionStatus = existingSub.status;
      await provider.save();
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existingSub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (existingSub) {
    existingSub.status = 'inactive';
    existingSub.updatedAt = new Date();
    await existingSub.save();

    const provider = await ServiceProvider.findById(existingSub.providerId);
    if (provider) {
      provider.subscriptionStatus = 'inactive';
      await provider.save();
    }
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    const existingSub = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    if (existingSub) {
      // Payment succeeded, ensure subscription is active
      existingSub.status = 'active';
      existingSub.updatedAt = new Date();
      await existingSub.save();

      const provider = await ServiceProvider.findById(existingSub.providerId);
      if (provider) {
        provider.subscriptionStatus = 'active';
        await provider.save();
      }
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    const existingSub = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    if (existingSub) {
      // Payment failed, could set to inactive or handle grace period
      console.log('Payment failed for subscription:', existingSub._id);
    }
  }
}
