# 🏠 Home Service Management (HSM)

A comprehensive platform connecting customers with trusted service providers for home services. Built with Next.js, featuring subscription management, real-time notifications, and a seamless user experience.

![HSM Logo](https://img.shields.io/badge/HSM-Home%20Service%20Management-blue?style=for-the-badge&logo=home&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.18-green?style=flat-square&logo=mongodb)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?style=flat-square&logo=stripe)

## ✨ Features

### 👥 User Management
- **Role-based Authentication**: Separate dashboards for customers and service providers
- **Secure Login**: NextAuth integration with JWT tokens
- **Profile Management**: Complete user profile customization
- **Registration System**: Streamlined onboarding process

### 🔧 Service Management
- **Service Requests**: Customers can create and track service requests
- **Provider Directory**: Browse verified service providers
- **Real-time Updates**: Live status updates for all requests
- **Service Categories**: Organized service types and specializations

### 💳 Subscription System
- **Tiered Plans**: Basic ($9.99/month) and Premium ($19.99/month) subscriptions
- **Stripe Integration**: Secure payment processing
- **Auto-renewal**: Seamless subscription management
- **Provider Visibility**: Subscription-based provider discoverability

### 🔔 Notification System
- **Real-time Notifications**: Instant updates for service requests
- **Subscription Alerts**: Automatic expiry warnings and renewals
- **Email Integration**: Configurable notification preferences
- **Admin Dashboard**: Centralized notification management

### 📊 Dashboard & Analytics
- **Customer Dashboard**: Track requests, view history, manage profile
- **Provider Dashboard**: Manage services, view earnings, subscription status
- **Admin Panel**: System-wide monitoring and management
- **Performance Metrics**: Service completion rates and customer satisfaction

### ⭐ Feedback & Ratings
- **Rating System**: 5-star rating for completed services
- **Review Platform**: Detailed feedback and testimonials
- **Quality Assurance**: Verified provider ratings
- **Trust Building**: Transparent review system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for payments)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/home-service-management.git
   cd home-service-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/hsm

   # Authentication
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000

   # Stripe (for payments)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_your_basic_price_id
   NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_your_premium_price_id

   # Optional: Cron Security
   CRON_SECRET_TOKEN=your-secure-token-here
   ```

4. **Set up the database**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
home-service-management/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── stripe/        # Payment processing
│   │   │   ├── subscription/  # Subscription management
│   │   │   └── notifications/ # Notification system
│   │   ├── dashboard/         # User dashboards
│   │   ├── login/             # Authentication pages
│   │   └── providers/         # Provider directory
│   ├── components/            # Reusable components
│   ├── lib/                   # Utility functions
│   ├── models/                # MongoDB schemas
│   └── types/                 # TypeScript definitions
├── scripts/                   # Utility scripts
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **State Management**: React Hooks + Context

### Backend
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose 8.18
- **Authentication**: NextAuth.js 4.24
- **Payments**: Stripe API
- **Validation**: Built-in TypeScript validation

### DevOps & Deployment
- **Platform**: Vercel
- **Database**: MongoDB Atlas
- **Monitoring**: Vercel Analytics
- **CI/CD**: GitHub Actions

## 🔧 Configuration

### Stripe Setup
For payment processing, follow the [Stripe Setup Guide](./STRIPE_SETUP.md)

### Vercel Deployment
For production deployment, see the [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)

### Subscription Notifications
Learn about automated notifications in the [Subscription Notifications Guide](./SUBSCRIPTION_NOTIFICATIONS.md)

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run seed         # Seed database with sample data

# Utilities
npm run clean        # Clean build files
npm run dev:clean    # Clean and restart dev server
```

## 🔐 Environment Variables

### Required
- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: NextAuth secret key
- `NEXTAUTH_URL`: Application URL

### Stripe (Optional)
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `NEXT_PUBLIC_STRIPE_PRICE_BASIC`: Basic plan price ID
- `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM`: Premium plan price ID

### Security (Optional)
- `CRON_SECRET_TOKEN`: Token for cron job security

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]`: NextAuth handlers
- `POST /api/users/register`: User registration
- `POST /api/users/login`: User login

### Services
- `GET /api/providers`: List service providers
- `GET /api/requests`: Get service requests
- `POST /api/requests`: Create service request

### Payments
- `POST /api/stripe/checkout`: Create checkout session
- `POST /api/stripe/webhook`: Handle Stripe webhooks

### Notifications
- `GET /api/notifications`: Get user notifications
- `POST /api/subscription-notifications`: Manage subscription alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Use conventional commits

## 📊 Database Schema

### Core Models
- **User**: Authentication and profile data
- **ServiceProvider**: Provider information and services
- **Request**: Service requests and status tracking
- **Subscription**: Payment and subscription management
- **Notification**: System and user notifications
- **Feedback**: Service reviews and ratings

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm run start
```

## 🐛 Troubleshooting

### Common Issues
- **Database Connection**: Verify MongoDB URI and network access
- **Stripe Webhooks**: Check webhook endpoints and secrets
- **Authentication**: Ensure NextAuth configuration is correct
- **Build Errors**: Clear cache with `npm run clean`

### Debug Mode
Enable debug logging:
```env
DEBUG=*
```

## 📈 Performance

### Optimization Features
- **Server-Side Rendering**: Fast initial page loads
- **Image Optimization**: Automatic image compression
- **Database Indexing**: Optimized query performance
- **Caching**: Smart caching strategies

### Monitoring
- **Vercel Analytics**: Performance monitoring
- **Database Logs**: Query performance tracking
- **Error Tracking**: Comprehensive error logging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Stripe](https://stripe.com/) - Payment processing
- [MongoDB](https://mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and solutions

---

**Made with ❤️ for connecting service providers with customers**
