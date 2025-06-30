# FrugalTops - Smart Clothing Deal Finder

FrugalTops is a web application that helps users find the most affordable clothing options across various online retailers while ensuring quality through review analysis and brand reputation checks.

## Features

### Core Features
- Search for clothing items across multiple retailers
- Filter results by price, quality metrics, and brand reputation
- View detailed product information including reviews and ratings
- Sort results by best value (price to quality ratio)

### New Features (Latest Release)

#### 🤖 AI-Powered Product Recommendations
- **Smart Suggestions**: Get personalized product recommendations based on your search history and preferences
- **Multiple Recommendation Types**: 
  - Similar searches
  - Brand preferences
  - Price range matches
  - Category interests
  - Trending products
- **Match Scoring**: See how well each recommendation fits your preferences
- **Category & Sort Filters**: Filter recommendations by category and sort by relevance, price, rating, or newest

#### 🔔 Smart Deal Alert System
- **Price Drop Alerts**: Set target prices and get notified when items drop below your threshold
- **Multiple Alert Types**:
  - Price drop notifications
  - New deal alerts
  - Back in stock notifications
  - Flash sale alerts
- **Flexible Notifications**: Choose email, push, or SMS notifications
- **Alert Management**: View, edit, and delete your active alerts
- **Savings Tracking**: Monitor your potential and actual savings from triggered alerts

#### 🤝 Social Sharing & Community Features
- **Deal Sharing**: Share great deals with the community and explain why they're worth it
- **Product Reviews**: Read and write detailed reviews with ratings and helpful votes
- **Community Engagement**: Like and comment on shared deals
- **Trending Deals**: Discover popular deals shared by other users
- **User Verification**: Verified user badges for trusted community members

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Query for data fetching
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript for type safety
- MongoDB for database
- Puppeteer for web scraping
- Jest for testing

## Project Structure

```
frugaltops/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # React components
│   │   │   ├── ProductRecommendations.tsx    # AI recommendations
│   │   │   ├── DealAlertSystem.tsx           # Deal alerts
│   │   │   ├── SocialSharing.tsx             # Social features
│   │   │   └── FeaturesDemo.tsx              # Demo page
│   │   └── services/   # API services
├── server/             # Backend Express application
│   ├── src/
│   │   ├── routes/     # API routes
│   │   │   ├── recommendations.ts  # AI recommendations API
│   │   │   ├── social.ts           # Social features API
│   │   │   └── dealAlerts.ts       # Deal alerts API
│   │   ├── models/     # Database models
│   │   └── services/   # Business logic
└── shared/             # Shared types and utilities
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/frugaltops.git
cd frugaltops
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables:
Create `.env` files in both client and server directories based on the provided `.env.example` files.

4. Start the development servers:
```bash
# Start backend server
cd server
npm run dev

# Start frontend development server
cd ../client
npm run dev
```

## API Endpoints

### Recommendations
- `GET /api/recommendations` - Get personalized product recommendations
- `GET /api/recommendations/trending` - Get trending products
- `GET /api/recommendations/similar/:productId` - Get similar products

### Deal Alerts
- `GET /api/deal-alerts` - Get user's deal alerts
- `POST /api/deal-alerts` - Create a new deal alert
- `PUT /api/deal-alerts/:alertId` - Update a deal alert
- `DELETE /api/deal-alerts/:alertId` - Delete a deal alert
- `POST /api/deal-alerts/check-triggers` - Check for triggered alerts
- `GET /api/deal-alerts/stats/:userId` - Get alert statistics

### Social Features
- `GET /api/social/reviews` - Get product reviews
- `POST /api/social/reviews` - Create a new review
- `POST /api/social/reviews/:reviewId/:action` - Mark review as helpful/unhelpful
- `GET /api/social/shares` - Get shared deals
- `POST /api/social/shares` - Share a deal
- `POST /api/social/shares/:shareId/:action` - Like/unlike a shared deal
- `GET /api/social/trending` - Get trending shared deals

## Development Status

This project is currently in active development. The basic structure and core features are implemented, with three major new features added in the latest release:

### ✅ Completed Features
- Product search and filtering
- Price history tracking
- Wishlist functionality
- **AI-powered recommendations**
- **Smart deal alert system**
- **Social sharing and reviews**

### 🚧 In Progress
- Advanced recommendation algorithms
- Real-time notifications
- User authentication and profiles
- Mobile app development

### 📋 Planned Features
- Machine learning price predictions
- Browser extension
- Multi-language support
- Advanced analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.