# Stripe Integration Setup Guide

This guide will help you set up Stripe payment processing for the subscription system.

## 1. Create a Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up for a new account or log in to your existing account
3. Complete the account verification process

## 2. Get Your API Keys

1. In your Stripe Dashboard, go to **Developers** > **API Keys**
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)

## 3. Create Products and Prices

### Create Basic Plan Product

1. Go to **Products** in your Stripe Dashboard
2. Click **Create Product**
3. Fill in the details:
   - **Name**: Basic Subscription
   - **Description**: Basic service provider subscription
4. Add pricing:
   - **Price**: $9.99
   - **Billing period**: Monthly
   - **Currency**: USD
5. Save the product
6. Copy the **Price ID** (starts with `price_`)

### Create Premium Plan Product

1. Repeat the process for Premium plan:
   - **Name**: Premium Subscription
   - **Description**: Premium service provider subscription
   - **Price**: $19.99
   - **Billing period**: Monthly
2. Copy the **Price ID**

## 4. Set Up Webhooks

### For Development (Stripe CLI)

1. **Install Stripe CLI**:
   ```bash
   # Download from: https://stripe.com/docs/stripe-cli
   # Or install via npm:
   npm install -g stripe
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** from the CLI output (starts with `whsec_`)

5. **Add to your `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_cli_generated_secret
   ```

### For Production

1. Go to **Developers** > **Webhooks** in your Stripe Dashboard
2. Click **Add endpoint**
3. Set the endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## 5. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_your_basic_price_id_here
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_your_premium_price_id_here
```

## 6. Test the Integration

1. Start your development server
2. Go to the subscription page as a provider
3. Try subscribing to a plan
4. Complete the payment flow
5. Verify that the subscription is created in your database
6. Check that the provider becomes visible to customers

## 7. Go Live (Production)

When you're ready to go live:

1. Replace all test keys with live keys in your environment variables
2. Update the webhook endpoint URL to your production domain
3. Create live products and prices in your Stripe dashboard
4. Update the price IDs in your environment variables
5. Test thoroughly in production

## Troubleshooting

### Webhook Events Not Firing
- Make sure your webhook endpoint is publicly accessible
- Verify the webhook signing secret is correct
- Check that all required events are selected

### Payments Not Processing
- Ensure your Stripe account is in test mode for testing
- Check that the price IDs are correct
- Verify the publishable key is set correctly in the frontend

### Subscription Not Activating
- Check that webhooks are being received
- Verify the webhook handler is processing events correctly
- Check database logs for any errors

## Support

For more information, refer to the [Stripe Documentation](https://stripe.com/docs).
