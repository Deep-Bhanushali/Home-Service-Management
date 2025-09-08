import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { status } = await request.json();

    // Validate status
    if (!['pending', 'active', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Find and update the request
    const updatedRequest = await Request.findByIdAndUpdate(
      params.id,
      {
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('customerId', 'name email')
     .populate('providerId', 'name email');

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Verify the user has permission to update this request
    if (session.user.role === 'provider' && updatedRequest.providerId._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.user.role === 'customer' && updatedRequest.customerId._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create notification for request acceptance
    if (status === 'active' && session.user.role === 'provider') {
      try {
        const provider = await User.findById(session.user.id, 'name');

        const notification = new Notification({
          recipientId: updatedRequest.customerId._id,
          senderId: session.user.id,
          type: 'request_accepted',
          title: 'Request Accepted',
          message: `Your service request has been accepted by ${provider?.name || 'a provider'}`,
          requestId: updatedRequest._id,
        });

        await notification.save();
        console.log('Acceptance notification created for customer:', updatedRequest.customerId._id);
      } catch (notificationError) {
        console.error('Error creating acceptance notification:', notificationError);
        // Don't fail the request if notification creation fails
      }
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
