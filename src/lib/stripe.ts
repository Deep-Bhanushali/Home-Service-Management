import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: (process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion) || '2023-10-16',
});

export const getStripePrices = async () => {
  const prices = await stripe.prices.list({
    active: true,
    type: 'recurring',
  });

  return prices.data;
};

export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  userEmail: string,
  metadata: Record<string, string>
) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/subscription?canceled=true`,
    customer_email: userEmail,
    metadata: {
      userId,
      ...metadata,
    },
  });

  return session;
};

export const createCustomerPortalSession = async (customerId: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/subscription`,
  });

  return session;
};
