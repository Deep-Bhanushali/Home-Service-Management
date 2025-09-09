import dbConnect from './db';
import Subscription from '../models/Subscription';
import ServiceProvider from '../models/ServiceProvider';
import Notification from '../models/Notification';
import { Types } from 'mongoose';

export interface SubscriptionNotification {
  providerId: string;
  subscriptionId: string;
  daysUntilExpiry: number;
  expiryDate: Date;
}

// Interface to describe the shape of the populated provider data
interface ProviderWithUser {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subscriptionStatus: string;
}

/**
 * Check for subscriptions that are about to expire and create notifications
 */
export async function checkExpiringSubscriptions(): Promise<SubscriptionNotification[]> {
  await dbConnect();

  const now = new Date();
  const warningDays = [30, 14, 7, 3, 1]; // Days before expiry to send warnings
  const notifications: SubscriptionNotification[] = [];

  for (const days of warningDays) {
    const warningDate = new Date();
    warningDate.setDate(now.getDate() + days);

    // Find subscriptions expiring within the warning period
    const expiringSubscriptions = await Subscription.find({
      status: 'active',
      endDate: {
        $gte: now,
        $lte: warningDate
      }
    }).populate('providerId');

    for (const subscription of expiringSubscriptions) {
      // Cast the populated provider to our interface for type safety
      const provider = subscription.providerId as ProviderWithUser;

      if (provider && provider.userId) {
        // Check if notification already exists for this subscription and warning period
        const existingNotification = await Notification.findOne({
          recipientId: provider.userId,
          type: 'subscription_expiring',
          'metadata.subscriptionId': subscription._id,
          'metadata.daysUntilExpiry': days,
          createdAt: {
            $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Within last 24 hours
          }
        });

        if (!existingNotification) {
          // Create notification
          await Notification.create({
            recipientId: provider.userId,
            senderId: provider.userId, // System notification, sender is the provider themselves
            type: 'subscription_expiring',
            title: 'Subscription Expiring Soon',
            message: `Your subscription will expire in ${days} day${days === 1 ? '' : 's'}. Please renew to continue receiving service requests.`,
            metadata: {
              subscriptionId: subscription._id,
              daysUntilExpiry: days,
              expiryDate: subscription.endDate
            },
            isRead: false
          });

          notifications.push({
            providerId: provider._id.toString(),
            subscriptionId: subscription._id.toString(),
            daysUntilExpiry: days,
            expiryDate: subscription.endDate
          });
        }
      }
    }
  }

  return notifications;
}

/**
 * Check for expired subscriptions and create notifications
 */
export async function checkExpiredSubscriptions(): Promise<SubscriptionNotification[]> {
  await dbConnect();

  const now = new Date();
  const notifications: SubscriptionNotification[] = [];

  // Find expired subscriptions that haven't been notified yet
  const expiredSubscriptions = await Subscription.find({
    status: 'active',
    endDate: { $lt: now }
  }).populate('providerId');

  for (const subscription of expiredSubscriptions) {
    const provider = subscription.providerId as ProviderWithUser;

    if (provider && provider.userId) {
      // Check if notification already exists for this expired subscription
      const existingNotification = await Notification.findOne({
        recipientId: provider.userId,
        type: 'subscription_expired',
        'metadata.subscriptionId': subscription._id,
        createdAt: {
          $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Within last 24 hours
        }
      });

      if (!existingNotification) {
        // Create notification
        await Notification.create({
          recipientId: provider.userId,
          senderId: provider.userId, // System notification
          type: 'subscription_expired',
          title: 'Subscription Expired',
          message: 'Your subscription has expired. Renew now to continue receiving service requests and being visible to customers.',
          metadata: {
            subscriptionId: subscription._id,
            expiryDate: subscription.endDate
          },
          isRead: false
        });

        // Update subscription status to inactive
        subscription.status = 'inactive';
        await subscription.save();

        // --- CORRECTED CODE ---
        // Update the provider's status directly in the database using its model
        await ServiceProvider.findByIdAndUpdate(provider._id, {
          subscriptionStatus: 'inactive'
        });
        // --- END OF CORRECTION ---

        notifications.push({
          providerId: provider._id.toString(),
          subscriptionId: subscription._id.toString(),
          daysUntilExpiry: 0,
          expiryDate: subscription.endDate
        });
      }
    }
  }

  return notifications;
}

/**
 * Get subscription notifications for a specific provider
 */
export async function getProviderSubscriptionNotifications(providerId: string) {
  await dbConnect();

  const provider = await ServiceProvider.findById(providerId);
  if (!provider) {
    throw new Error('Provider not found');
  }

  const notifications = await Notification.find({
    recipientId: provider.userId,
    type: { $in: ['subscription_expiring', 'subscription_expired'] }
  })
  .sort({ createdAt: -1 })
  .limit(10);

  return notifications;
}

/**
 * Mark subscription notification as read
 */
export async function markSubscriptionNotificationAsRead(notificationId: string, userId: string) {
  await dbConnect();

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipientId: userId,
      type: { $in: ['subscription_expiring', 'subscription_expired'] }
    },
    { isRead: true },
    { new: true }
  );

  return notification;
}