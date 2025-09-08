import dbConnect from './db';
import User from './models/User';
import ServiceProvider from './models/ServiceProvider';
import Request from './models/Request';
import Feedback from './models/Feedback';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    await dbConnect();
    console.log('🌱 Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await ServiceProvider.deleteMany({});
    await Request.deleteMany({});
    await Feedback.deleteMany({});

    // Create sample users
    const users = [
      {
        name: 'John Customer',
        email: 'john@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'customer',
        address: '123 Main St, City, State',
        contact: '+1-555-0101',
      },
      {
        name: 'Jane Customer',
        email: 'jane@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'customer',
        address: '456 Oak Ave, City, State',
        contact: '+1-555-0102',
      },
      {
        name: 'Mike Plumber',
        email: 'mike@plumbing.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'provider',
        address: '789 Service Rd, City, State',
        contact: '+1-555-0201',
      },
      {
        name: 'Sarah Electrician',
        email: 'sarah@electric.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'provider',
        address: '321 Power St, City, State',
        contact: '+1-555-0202',
      },
      {
        name: 'Tom Carpenter',
        email: 'tom@carpentry.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'provider',
        address: '654 Wood Ln, City, State',
        contact: '+1-555-0203',
      },
      {
        name: 'Lisa Cleaner',
        email: 'lisa@cleaning.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'provider',
        address: '987 Clean Blvd, City, State',
        contact: '+1-555-0204',
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Created users:', createdUsers.length);

    // Create service providers
    const providers = [
      {
        userId: createdUsers[2]._id, // Mike Plumber
        skills: ['Plumbing', 'Pipe Repair', 'Drain Cleaning'],
        availability: true,
        rating: 4.8,
      },
      {
        userId: createdUsers[3]._id, // Sarah Electrician
        skills: ['Electrical Wiring', 'Circuit Repair', 'Lighting Installation'],
        availability: true,
        rating: 4.9,
      },
      {
        userId: createdUsers[4]._id, // Tom Carpenter
        skills: ['Woodworking', 'Furniture Repair', 'Cabinet Installation'],
        availability: true,
        rating: 4.7,
      },
      {
        userId: createdUsers[5]._id, // Lisa Cleaner
        skills: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning'],
        availability: true,
        rating: 4.6,
      },
    ];

    const createdProviders = await ServiceProvider.insertMany(providers);
    console.log('✅ Created service providers:', createdProviders.length);

    // Create sample requests
    const requests = [
      {
        customerId: createdUsers[0]._id, // John Customer
        providerId: createdUsers[2]._id, // Mike Plumber
        description: 'Leaky faucet in kitchen needs repair',
        status: 'completed',
      },
      {
        customerId: createdUsers[0]._id, // John Customer
        providerId: createdUsers[3]._id, // Sarah Electrician
        description: 'Install new light fixtures in living room',
        status: 'active',
      },
      {
        customerId: createdUsers[1]._id, // Jane Customer
        providerId: createdUsers[4]._id, // Tom Carpenter
        description: 'Build custom shelves in home office',
        status: 'pending',
      },
      {
        customerId: createdUsers[1]._id, // Jane Customer
        providerId: createdUsers[5]._id, // Lisa Cleaner
        description: 'Deep clean entire house before party',
        status: 'completed',
      },
      {
        customerId: createdUsers[0]._id, // John Customer
        providerId: createdUsers[5]._id, // Lisa Cleaner
        description: 'Regular house cleaning service',
        status: 'pending',
      },
    ];

    const createdRequests = await Request.insertMany(requests);
    console.log('✅ Created service requests:', createdRequests.length);

    // Create sample feedback
    const feedbacks = [
      {
        requestId: createdRequests[0]._id,
        customerId: createdUsers[0]._id,
        providerId: createdUsers[2]._id,
        rating: 5,
        comment: 'Excellent work! Fixed the leak quickly and professionally.',
      },
      {
        requestId: createdRequests[3]._id,
        customerId: createdUsers[1]._id,
        providerId: createdUsers[5]._id,
        rating: 4,
        comment: 'Great cleaning service. Very thorough and detail-oriented.',
      },
    ];

    const createdFeedback = await Feedback.insertMany(feedbacks);
    console.log('✅ Created feedback:', createdFeedback.length);

    // Update provider ratings based on feedback
    for (const provider of createdProviders) {
      const providerFeedback = await Feedback.find({ providerId: provider.userId });
      if (providerFeedback.length > 0) {
        const avgRating = providerFeedback.reduce((sum, f) => sum + f.rating, 0) / providerFeedback.length;
        await ServiceProvider.findByIdAndUpdate(provider._id, { rating: avgRating });
      }
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Customer: john@example.com / password123');
    console.log('Customer: jane@example.com / password123');
    console.log('Provider: mike@plumbing.com / password123');
    console.log('Provider: sarah@electric.com / password123');
    console.log('Provider: tom@carpentry.com / password123');
    console.log('Provider: lisa@cleaning.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// For running the seed script
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
