# Subscription Notification System

This document explains how the subscription notification system works and how to use it.

## Overview

The subscription notification system automatically monitors subscription expiry dates and sends notifications to providers when their subscriptions are about to expire or have expired.

## Features

### 🔄 Automatic Monitoring
- Checks for subscriptions expiring in 30, 14, 7, 3, and 1 days
- Automatically marks expired subscriptions as inactive
- Prevents duplicate notifications within 24-hour periods

### 📧 Notification Types

#### Subscription Expiring
- Sent when subscription expires in 30, 14, 7, 3, or 1 days
- Message: "Your subscription will expire in X day(s). Please renew to continue receiving service requests."

#### Subscription Expired
- Sent when subscription has already expired
- Message: "Your subscription has expired. Renew now to continue receiving service requests and being visible to customers."
- Automatically updates provider status to inactive

## API Endpoints

### Get Provider Notifications
```http
GET /api/subscription-notifications
```
Returns subscription-specific notifications for the authenticated provider.

### Admin Actions
```http
POST /api/subscription-notifications
Content-Type: application/json

{
  "action": "check-expiring" | "check-expired"
}
```
Admin-only endpoint to manually trigger notification checks.

### Mark as Read
```http
POST /api/subscription-notifications
Content-Type: application/json

{
  "action": "mark-read",
  "notificationId": "notification_id_here"
}
```
Mark a specific notification as read.

## Running Notification Checks

### Manual Script Execution
Run the notification check script manually:

```bash
# From project root
node scripts/check-subscription-notifications.js
```

### Scheduled Execution (Cron Job)
Set up a cron job to run daily:

```bash
# Add to crontab (crontab -e)
0 9 * * * cd /path/to/your/project && node scripts/check-subscription-notifications.js
```

This will run the script every day at 9 AM.

### Using PM2 (Production)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
echo '{
  "apps": [{
    "name": "subscription-notifications",
    "script": "scripts/check-subscription-notifications.js",
    "cron_restart": "0 9 * * *"
  }]
}' > ecosystem.config.json

# Start with PM2
pm2 start ecosystem.config.json
```

## Database Schema

### Notification Model Updates
The notification model has been updated to support subscription notifications:

```javascript
{
  type: 'subscription_expiring' | 'subscription_expired',
  metadata: {
    subscriptionId: ObjectId,
    daysUntilExpiry: Number,
    expiryDate: Date
  }
}
```

## Integration with Existing Notifications

Subscription notifications are included in the main notifications API (`/api/notifications`) and will appear alongside service request notifications.

## Testing

### Create Test Subscriptions
1. Create a provider account
2. Subscribe to a plan
3. Manually update the subscription `endDate` in the database to a date within the next 30 days
4. Run the notification check script

### Example Test Data
```javascript
// Set subscription to expire in 3 days
subscription.endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
await subscription.save();
```

## Monitoring

### Logs
The system logs all notification creation activities:
- Number of notifications created
- Provider IDs and expiry details
- Any errors during processing

### Database Queries
Check notification creation:
```javascript
// Find all subscription notifications
db.notifications.find({
  type: { $in: ['subscription_expiring', 'subscription_expired'] }
})

// Find unread subscription notifications
db.notifications.find({
  type: { $in: ['subscription_expiring', 'subscription_expired'] },
  isRead: false
})
```

## Troubleshooting

### Notifications Not Being Created
1. Check that subscriptions have correct `endDate` values
2. Verify the script is running with proper environment variables
3. Check MongoDB connection and permissions

### Duplicate Notifications
The system prevents duplicates within 24-hour windows. If you need to reset:
```javascript
// Delete recent notifications for testing
db.notifications.deleteMany({
  type: 'subscription_expiring',
  createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
})
```

### Provider Status Not Updating
Ensure the provider document has a valid `userId` that matches the notification `recipientId`.

## Best Practices

1. **Run Daily**: Set up automated daily checks
2. **Monitor Logs**: Regularly check script execution logs
3. **Test Regularly**: Test with different expiry scenarios
4. **Backup Data**: Ensure database backups before running scripts
5. **Environment Variables**: Use production environment variables in live systems

## Future Enhancements

- Email notifications (integrate with email service)
- Push notifications (integrate with push notification service)
- Customizable warning periods
- Provider-specific notification preferences
- Analytics dashboard for notification metrics
