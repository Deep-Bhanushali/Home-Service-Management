import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    let requests;
    if (session.user.role === 'customer') {
      requests = await Request.find({ customerId: session.user.id }).populate('providerId', 'name email');
      console.log('Customer requests found:', requests.length);
      requests.forEach((req, index) => {
        console.log(`Request ${index}: providerId=${req.providerId}, name=${req.providerId?.name}`);
      });
    } else {
      requests = await Request.find({ providerId: session.user.id }).populate('customerId', 'name email');
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { providerId, description } = await request.json();
    console.log('Creating request with providerId:', providerId, 'customerId:', session.user.id);

    const newRequest = new Request({
      customerId: session.user.id,
      providerId,
      description,
    });

    const savedRequest = await newRequest.save();
    console.log('Request saved with _id:', savedRequest._id, 'providerId:', savedRequest.providerId);

    // Create notification for the provider
    try {
      const customer = await User.findById(session.user.id, 'name email');

      const notification = new Notification({
        recipientId: providerId,
        senderId: session.user.id,
        type: 'service_request',
        title: 'New Service Request',
        message: `New service request from ${customer?.name || 'a customer'}: ${description}`,
        requestId: savedRequest._id,
      });

      await notification.save();
      console.log('Notification created for provider:', providerId);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json(savedRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
