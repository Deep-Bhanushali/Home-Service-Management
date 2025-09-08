import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ServiceProvider from '@/lib/models/ServiceProvider';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // First, get all available service providers
    const providers = await ServiceProvider.find({ availability: true });
    console.log('Found providers:', providers.length);

    if (providers.length === 0) {
      console.log('No providers found in database');
      return NextResponse.json([]);
    }

    // Get user details for each provider
    const providerIds = providers.map(p => p.userId);
    console.log('Provider user IDs:', providerIds);

    const users = await User.find({ _id: { $in: providerIds } }, 'name email contact');
    console.log('Found users:', users.length);

    // Combine provider and user data
    const providersWithUserData = providers.map(provider => {
      const user = users.find(u => u._id.toString() === provider.userId.toString());
      console.log('Provider:', provider.userId, 'User found:', !!user);
      return {
        _id: provider._id,
        userId: user ? {
          _id: user._id,
          name: user.name,
          email: user.email,
          contact: user.contact
        } : null,
        skills: provider.skills,
        availability: provider.availability,
        rating: provider.rating
      };
    }).filter(p => p.userId !== null); // Filter out providers with missing user data

    console.log('Final providers with user data:', providersWithUserData.length);
    return NextResponse.json(providersWithUserData);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
