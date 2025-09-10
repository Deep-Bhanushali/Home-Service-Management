import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ServiceProvider from '@/models/ServiceProvider';

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find({});
    const providers = await ServiceProvider.find({});

    return NextResponse.json({
      usersCount: users.length,
      providersCount: providers.length,
      users: users.map(u => ({ name: u.name, email: u.email, role: u.role })),
      providers: providers.map(p => ({
        userId: p.userId,
        skills: p.skills,
        availability: p.availability,
        rating: p.rating
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}
