import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import ServiceProvider from '@/models/ServiceProvider';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const provider = await ServiceProvider.findOne({ userId: session.user.id });

    if (!provider) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: provider._id,
      userId: provider.userId,
      skills: provider.skills,
      availability: provider.availability,
      rating: provider.rating,
      subscriptionStatus: provider.subscriptionStatus,
    });
  } catch (error) {
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
    const { skills, availability } = await request.json();

    const updatedProvider = await ServiceProvider.findOneAndUpdate(
      { userId: session.user.id },
      { skills, availability },
      { new: true }
    );

    if (!updatedProvider) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: updatedProvider._id,
      userId: updatedProvider.userId,
      skills: updatedProvider.skills,
      availability: updatedProvider.availability,
      rating: updatedProvider.rating,
      subscriptionStatus: updatedProvider.subscriptionStatus,
    });
  } catch (error) {
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

    // Check if provider profile already exists
    const existingProvider = await ServiceProvider.findOne({ userId: session.user.id });
    if (existingProvider) {
      return NextResponse.json({ error: 'Provider profile already exists' }, { status: 400 });
    }

    const { skills, availability } = await request.json();

    const newProvider = new ServiceProvider({
      userId: session.user.id,
      skills: skills || [],
      availability: availability !== undefined ? availability : true,
    });

    await newProvider.save();

    return NextResponse.json({
      _id: newProvider._id,
      userId: newProvider.userId,
      skills: newProvider.skills,
      availability: newProvider.availability,
      rating: newProvider.rating,
      subscriptionStatus: newProvider.subscriptionStatus,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
