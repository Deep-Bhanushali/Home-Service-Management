# Vercel Deployment Guide for Subscription Notifications

This guide covers how to deploy your home service management application with subscription notifications on Vercel.

## 🚀 Deployment Options

### Option 1: Vercel Cron Jobs (Recommended - Pro Plan)

If you have Vercel Pro plan, you can use built-in cron jobs:

#### 1. Configure `vercel.json`
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/subscription-notifications/cron",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### 2. Environment Variables
Add to Vercel dashboard:
```env
CRON_SECRET_TOKEN=your-secure-token-here
```

#### 3. Deploy
```bash
vercel --prod
```

### Option 2: External Cron Service (Free/Hobby Plan)

Use services like Cron-Job.org, EasyCron, or GitHub Actions:

#### Using Cron-Job.org (Free)
1. Go to [cron-job.org](https://cron-job.org)
2. Create account
3. Add cron job:
   - URL: `https://your-app.vercel.app/api/subscription-notifications/cron`
   - Method: GET
   - Headers: `Authorization: Bearer your-secure-token`
   - Schedule: `0 9 * * *` (daily at 9 AM)

#### Using GitHub Actions (Free)
Create `.github/workflows/subscription-notifications.yml`:
```yaml
name: Subscription Notifications

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notifications
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_TOKEN }}" \
            https://your-app.vercel.app/api/subscription-notifications/cron
```

### Option 3: Manual Triggers

For testing or manual control:

#### Browser Trigger
```javascript
// Manual trigger from browser console
fetch('/api/subscription-notifications/cron', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token'
  }
}).then(r => r.json()).then(console.log);
```

#### Admin Dashboard Button
Add to your admin dashboard:
```jsx
<button
  onClick={() => fetch('/api/subscription-notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'check-expiring' })
  })}
>
  Check Expiring Subscriptions
</button>
```

## 🔧 Environment Variables

Add these to your Vercel project settings:

### Required
```env
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### Stripe (if using payments)
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Cron Security (Optional but Recommended)
```env
CRON_SECRET_TOKEN=your-secure-random-token
```

## 📊 Monitoring & Logs

### Vercel Dashboard
- Go to your project → Functions → Logs
- Look for cron job executions
- Monitor function duration and errors

### Custom Logging
The cron endpoint returns detailed logs:
```json
{
  "success": true,
  "timestamp": "2025-10-12T09:00:00.000Z",
  "duration": "1250ms",
  "expiringNotifications": {
    "count": 3,
    "notifications": [...]
  },
  "expiredNotifications": {
    "count": 1,
    "notifications": [...]
  },
  "totalNotifications": 4
}
```

## 🛠️ Troubleshooting

### Issue: Cron Jobs Not Running
**Solutions:**
1. Check Vercel plan (Pro required for cron jobs)
2. Verify `vercel.json` syntax
3. Check function logs for errors
4. Test endpoint manually: `GET /api/subscription-notifications/cron`

### Issue: Function Timeout
**Solutions:**
1. Increase `maxDuration` in `vercel.json`
2. Optimize database queries
3. Consider pagination for large datasets

### Issue: Database Connection Issues
**Solutions:**
1. Use MongoDB Atlas connection string
2. Add IP whitelist for Vercel
3. Check connection limits

### Issue: Environment Variables Not Working
**Solutions:**
1. Redeploy after adding env vars
2. Check variable names match exactly
3. Use Vercel CLI: `vercel env ls`

## 📈 Performance Optimization

### Database Indexes
Ensure these indexes exist:
```javascript
// Subscription endDate index
db.subscriptions.createIndex({ endDate: 1, status: 1 });

// Notification indexes
db.notifications.createIndex({ recipientId: 1, createdAt: -1 });
db.notifications.createIndex({ type: 1, createdAt: -1 });
```

### Query Optimization
The notification system is optimized for:
- Large numbers of subscriptions
- Efficient date range queries
- Minimal database load

### Rate Limiting
Consider adding rate limiting for manual triggers:
```javascript
// In your API route
const recentCalls = await redis.get('cron_calls');
if (recentCalls > 10) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
}
```

## 🔒 Security Best Practices

### 1. Cron Token Security
```javascript
// In your cron route
const authHeader = request.headers.get('authorization');
const expectedToken = process.env.CRON_SECRET_TOKEN;

if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Input Validation
```javascript
// Validate cron requests
const allowedOrigins = ['cron-job.org', 'vercel.app'];
const origin = request.headers.get('origin');

if (!allowedOrigins.some(o => origin?.includes(o))) {
  return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
}
```

### 3. Error Handling
```javascript
// Don't expose internal errors
try {
  // Your code
} catch (error) {
  console.error('Internal error:', error);
  return NextResponse.json({
    success: false,
    error: 'Internal server error'
  }, { status: 500 });
}
```

## 📋 Pre-Deployment Checklist

- [ ] Test notification system locally
- [ ] Set up environment variables in Vercel
- [ ] Configure cron jobs or external service
- [ ] Test cron endpoint manually
- [ ] Verify database connection
- [ ] Check function timeouts
- [ ] Set up monitoring/alerts
- [ ] Test with production data

## 🚀 Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add subscription notifications"
   git push origin main
   ```

2. **Connect to Vercel**
   - Import project from GitHub
   - Configure environment variables
   - Set up custom domain (optional)

3. **Configure Cron Jobs**
   - Add `vercel.json` for Pro plan
   - Or set up external cron service

4. **Test Deployment**
   ```bash
   # Test cron endpoint
   curl https://your-app.vercel.app/api/subscription-notifications/cron

   # Test notification API
   curl https://your-app.vercel.app/api/notifications
   ```

5. **Monitor & Maintain**
   - Check Vercel function logs
   - Monitor notification creation
   - Update cron schedules as needed

## 💡 Pro Tips

1. **Use Vercel Analytics** to monitor function performance
2. **Set up error alerts** for failed cron jobs
3. **Test with staging environment** before production
4. **Keep backup scripts** for manual notification runs
5. **Document your cron schedules** for team reference

## 🎯 Success Metrics

Monitor these after deployment:
- ✅ Cron jobs run successfully
- ✅ Notifications created on schedule
- ✅ No function timeouts
- ✅ Database connections stable
- ✅ Provider notifications working

Your subscription notification system will work perfectly on Vercel! 🎉
