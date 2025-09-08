import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Feedback from '@/lib/models/Feedback';
import Request from '@/lib/models/Request';
import ServiceProvider from '@/lib/models/ServiceProvider';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { requestId, rating, comment } = await request.json();

    // Check if request exists and belongs to user
    const req = await Request.findOne({ _id: requestId, customerId: session.user.id, status: 'completed' });
    if (!req) {
      return NextResponse.json({ error: 'Request not found or not completed' }, { status: 404 });
    }

    const feedback = new Feedback({
      requestId,
      customerId: session.user.id,
      providerId: req.providerId,
      rating,
      comment,
    });

    await feedback.save();

    // Update provider rating
    const feedbacks = await Feedback.find({ providerId: req.providerId });
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    await ServiceProvider.findOneAndUpdate({ userId: req.providerId }, { rating: avgRating });

    return NextResponse.json(feedback, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
