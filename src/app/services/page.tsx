'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

// ... (interface and serviceCategories array remain the same) ...
interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Pipe repairs, installations, and maintenance',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    color: 'blue'
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Wiring, lighting, and electrical repairs',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'yellow'
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Woodworking, furniture, and home repairs',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    color: 'green'
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    description: 'House cleaning and maintenance services',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0z M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z',
    color: 'purple'
  },
  {
    id: 'painting',
    name: 'Painting',
    description: 'Interior and exterior painting services',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z',
    color: 'red'
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    description: 'Garden design and outdoor maintenance',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    color: 'emerald'
  }
];

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  const handleCategoryClick = (categoryId: string) => {
    // FIX: Use the state setter to provide visual feedback on click
    setSelectedCategory(categoryId);

    const skillMapping: { [key: string]: string } = {
      'plumbing': 'Plumbing',
      'electrical': 'Electrical Wiring',
      'carpentry': 'Woodworking',
      'cleaning': 'House Cleaning',
      'painting': 'Painting',
      'landscaping': 'Landscaping'
    };

    const skillName = skillMapping[categoryId] || categoryId;

    if (session?.user?.role === 'customer') {
      router.push(`/providers?skill=${encodeURIComponent(skillName)}`);
    } else if (session?.user?.role === 'provider') {
      // Future logic for providers can go here
    }
  };

  // ... (rest of the component remains the same) ...
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Services</h1>
          <p className="text-gray-600">
            {session.user?.role === 'customer'
              ? 'Browse our service categories and find the perfect professional for your needs'
              : 'Explore service categories to add to your skill set'
            }
          </p>
        </div>

        {/* Service Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {serviceCategories.map((category) => (
            <div
              key={category.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer overflow-hidden ${
                selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="p-6">
                <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <svg
                    className={`w-6 h-6 text-${category.color}-600`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Click to explore</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our Services?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Professionals</h3>
              <p className="text-gray-600 text-sm">All service providers are background checked and verified</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Rated</h3>
              <p className="text-gray-600 text-sm">Customer reviews and ratings for all completed services</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Pricing</h3>
              <p className="text-gray-600 text-sm">Transparent pricing with no hidden fees or charges</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-gray-600 text-sm">Fast response times and reliable service scheduling</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6 opacity-90">
            {session.user?.role === 'customer'
              ? 'Find the perfect service provider for your needs today'
              : 'Start offering your services to customers in your area'
            }
          </p>
          <div className="flex justify-center space-x-4">
            {session.user?.role === 'customer' ? (
              <>
                <button
                  onClick={() => router.push('/providers')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                >
                  Browse Providers
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
                >
                  My Dashboard
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
              >
                Manage My Services
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}