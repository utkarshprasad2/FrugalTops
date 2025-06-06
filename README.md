# FrugalTops - Smart Clothing Deal Finder

FrugalTops is a web application that helps users find the most affordable clothing options across various online retailers while ensuring quality through review analysis and brand reputation checks.

## Features

- Search for clothing items across multiple retailers
- Filter results by price, quality metrics, and brand reputation
- View detailed product information including reviews and ratings
- Sort results by best value (price to quality ratio)

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
├── server/             # Backend Express application
├── shared/             # Shared types and utilities
└── scripts/            # Development and deployment scripts
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

## Development Status

This project is currently in active development. The basic structure and core features are being implemented.