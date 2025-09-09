'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  stripePriceId?: string;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
    if (session?.user?.role !== 'provider') {
      router.push('/dashboard');
      return;
    }
    fetchSubscription();
  }, [session, status, router]);

  // Check for success/cancel parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Payment was successful, refresh subscription data
      fetchSubscription();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Define price IDs for different plans
    const priceIds = {
      basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'price_basic_monthly',
      premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium_monthly'
    };

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceIds[selectedPlan as keyof typeof priceIds],
          plan: selectedPlan,
          duration
        }),
      });

      if (res.ok) {
        const { url } = await res.json();
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create checkout session');
      }
    } catch (error) {
      toast.error('Failed to create checkout session');
    }
  };

  const handleSubscriptionAction = async (action: string) => {
    try {
      const res = await fetch('/api/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(`Subscription ${action}d successfully!`);
        fetchSubscription();
      } else {
        const error = await res.json();
        toast.error(error.error || `Failed to ${action} subscription`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} subscription`);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'provider') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your service provider subscription</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {subscription ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl text-gray-700 font-semibold mb-4">Current Subscription</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-semibold capitalize">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    subscription.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold">{new Date(subscription.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-semibold">{new Date(subscription.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {subscription.status === 'active' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleSubscriptionAction('renew')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Renew Subscription
                  </button>
                  <button
                    onClick={() => handleSubscriptionAction('cancel')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}

              {subscription.status === 'inactive' && (
                <button
                  onClick={() => setShowSubscribeForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Reactivate Subscription
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h2 className="text-xl text-gray-700 font-semibold mb-4">No Active Subscription</h2>
              <p className="text-gray-600 mb-6">
                You need an active subscription to be visible to customers and receive service requests.
              </p>
              <button
                onClick={() => setShowSubscribeForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Subscribe Now
              </button>
            </div>
          )}

          {showSubscribeForm && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg text-gray-700 font-semibold mb-4">Choose Subscription Plan</h3>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Basic - $9.99/month</option>
                    <option value="premium">Premium - $19.99/month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 month</option>
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                    <option value={12}>12 months</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Subscribe
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubscribeForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
