# Jewelry Store

A full-stack e-commerce platform for a jewelry store built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- Responsive design with Bootstrap
- User authentication and authorization
- Product catalog and search
- Shopping cart and checkout
- Payment processing with Stripe
- Admin dashboard for store management
- Order tracking and history

## Technology Stack

### Frontend
- React.js
- React Router for navigation
- Bootstrap for UI components
- FontAwesome icons
- Axios for API requests
- Chart.js for analytics
- Stripe for payment processing

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Stripe API integration

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas)
- Stripe account for payment processing

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/jewerly-store.git
   cd jewerly-store
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/jewelry_store
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

5. Run both frontend and backend concurrently:
   ```
   # From the root directory
   npm run dev:all
   ```

   Or run them separately:
   ```
   # For frontend (from root directory)
   npm run dev
   
   # For backend (from root directory)
   npm run server
   ```

## Project Structure

```
jewerly-store/
├── backend/               # Node.js backend
│   ├── src/              
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Middleware functions
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── server.js      # Server entry point
│   ├── .env               # Environment variables
│   └── package.json       # Backend dependencies
├── public/                # Static files
├── src/                   # React frontend
│   ├── assets/            # Images and static assets
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── layouts/           # Page layouts
│   ├── pages/             # Page components
│   ├── routes/            # Routes configuration
│   ├── services/          # API services
│   └── utils/             # Utility functions
├── .gitignore             # Git ignore file
├── package.json           # Frontend dependencies
└── README.md              # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
