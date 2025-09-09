import mongoose from 'mongoose';
import { checkExpiringSubscriptions, checkExpiredSubscriptions } from '../src/lib/subscription-notifications.js';

/**
 * Script to check for subscription notifications
 * Run this script periodically (e.g., daily) to check for expiring/expired subscriptions
 */

async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/home-service-management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get current date for debugging
    const now = new Date();
    console.log('Current date/time:', now.toISOString());
    console.log('Current timestamp:', now.getTime());

    // First, let's check what subscriptions exist
    const { default: Subscription } = await import('../src/lib/models/Subscription.js');
    const allSubscriptions = await Subscription.find({}).populate('providerId');
    console.log(`Found ${allSubscriptions.length} total subscriptions:`);

    allSubscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ID: ${sub._id}, Status: ${sub.status}, End Date: ${sub.endDate}, Provider: ${sub.providerId?.userId || 'No provider'}`);
    });

    console.log('\nChecking for expiring subscriptions...');
    const expiringNotifications = await checkExpiringSubscriptions();
    console.log(`Created ${expiringNotifications.length} expiring subscription notifications`);

    console.log('\nChecking for expired subscriptions...');
    const expiredNotifications = await checkExpiredSubscriptions();
    console.log(`Created ${expiredNotifications.length} expired subscription notifications`);

    console.log('\nSubscription notification check completed successfully');

    // Log details
    if (expiringNotifications.length > 0) {
      console.log('\nExpiring notifications created:');
      expiringNotifications.forEach(notification => {
        console.log(`- Provider ${notification.providerId}: expires in ${notification.daysUntilExpiry} days (${notification.expiryDate})`);
      });
    } else {
      console.log('\nNo expiring notifications created');
    }

    if (expiredNotifications.length > 0) {
      console.log('\nExpired notifications created:');
      expiredNotifications.forEach(notification => {
        console.log(`- Provider ${notification.providerId}: expired on ${notification.expiryDate}`);
      });
    } else {
      console.log('\nNo expired notifications created');
    }

  } catch (error) {
    console.error('Error checking subscription notifications:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
main().catch(console.error);
