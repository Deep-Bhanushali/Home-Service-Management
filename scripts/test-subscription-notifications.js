import mongoose from 'mongoose';
import { checkExpiringSubscriptions, checkExpiredSubscriptions } from '../src/lib/subscription-notifications.js';

/**
 * Test script to create test data and verify subscription notifications
 */

async function createTestSubscription() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/home-service-management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const { default: Subscription } = await import('../src/lib/models/Subscription.js');
    const { default: ServiceProvider } = await import('../src/lib/models/ServiceProvider.js');
    const { default: User } = await import('../src/lib/models/User.js');

    // Create a test user if it doesn't exist
    let testUser = await User.findOne({ email: 'test-provider@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test Provider',
        email: 'test-provider@example.com',
        password: 'testpassword',
        role: 'provider'
      });
      await testUser.save();
      console.log('Created test user:', testUser._id);
    }

    // Create a test provider if it doesn't exist
    let testProvider = await ServiceProvider.findOne({ userId: testUser._id });
    if (!testProvider) {
      testProvider = new ServiceProvider({
        userId: testUser._id,
        skills: ['Plumbing', 'Electrical'],
        availability: true,
        rating: 4.5,
        subscriptionStatus: 'active'
      });
      await testProvider.save();
      console.log('Created test provider:', testProvider._id);
    }

    // Create a test subscription that expires in 3 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3); // Expires in 3 days

    let testSubscription = await Subscription.findOne({ providerId: testProvider._id });
    if (!testSubscription) {
      testSubscription = new Subscription({
        providerId: testProvider._id,
        plan: 'Basic',
        status: 'active',
        endDate: expiryDate,
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123'
      });
      await testSubscription.save();
      console.log('Created test subscription:', testSubscription._id);
      console.log('Subscription expires on:', expiryDate.toISOString());
    } else {
      // Update existing subscription
      testSubscription.endDate = expiryDate;
      testSubscription.status = 'active';
      await testSubscription.save();
      console.log('Updated test subscription:', testSubscription._id);
      console.log('Subscription expires on:', expiryDate.toISOString());
    }

    console.log('\nTest data created successfully!');
    console.log('User ID:', testUser._id);
    console.log('Provider ID:', testProvider._id);
    console.log('Subscription ID:', testSubscription._id);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

async function runNotificationCheck() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/home-service-management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const now = new Date();
    console.log('Current date/time:', now.toISOString());

    console.log('\n=== RUNNING NOTIFICATION CHECK ===');

    console.log('\n1. Checking for expiring subscriptions...');
    const expiringNotifications = await checkExpiringSubscriptions();
    console.log(`✅ Created ${expiringNotifications.length} expiring subscription notifications`);

    console.log('\n2. Checking for expired subscriptions...');
    const expiredNotifications = await checkExpiredSubscriptions();
    console.log(`✅ Created ${expiredNotifications.length} expired subscription notifications`);

    // Check what notifications were created
    const { default: Notification } = await import('../src/lib/models/Notification.js');
    const recentNotifications = await Notification.find({
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    }).sort({ createdAt: -1 });

    console.log(`\n3. Recent notifications (${recentNotifications.length} found):`);
    recentNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.type}: ${notif.title}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Created: ${notif.createdAt}`);
      if (notif.metadata) {
        console.log(`   Metadata:`, JSON.stringify(notif.metadata, null, 2));
      }
      console.log('');
    });

    console.log('\n=== NOTIFICATION CHECK COMPLETE ===');

  } catch (error) {
    console.error('Error running notification check:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  const command = process.argv[2];

  if (command === 'create-test') {
    console.log('Creating test subscription data...');
    await createTestSubscription();
  } else if (command === 'check') {
    console.log('Running notification check...');
    await runNotificationCheck();
  } else if (command === 'both') {
    console.log('Creating test data and running notification check...');
    await createTestSubscription();
    console.log('\n' + '='.repeat(50) + '\n');
    await runNotificationCheck();
  } else {
    console.log('Usage:');
    console.log('  node scripts/test-subscription-notifications.js create-test  # Create test subscription');
    console.log('  node scripts/test-subscription-notifications.js check       # Run notification check');
    console.log('  node scripts/test-subscription-notifications.js both       # Do both');
  }
}

// Run the script
main().catch(console.error);
