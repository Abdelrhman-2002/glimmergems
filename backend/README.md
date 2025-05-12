# Jewelry Store Backend

A RESTful API for the Jewelry Store built with Node.js, Express, and MongoDB.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local instance or MongoDB Atlas)
- Stripe account for payment processing

## Getting Started

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/jewelry_store
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `POST /api/admin/login` - Admin login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product (Admin only)
- `PUT /api/products/:id` - Update a product (Admin only)
- `DELETE /api/products/:id` - Delete a product (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a single category
- `POST /api/categories` - Create a new category (Admin only)
- `PUT /api/categories/:id` - Update a category (Admin only)
- `DELETE /api/categories/:id` - Delete a category (Admin only)

### Orders
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/myorders` - Get current user orders
- `GET /api/orders/:id` - Get a single order
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Payments
- `POST /api/payments/create-intent` - Create a Stripe payment intent
- `POST /api/payments/confirm` - Confirm a payment
- `POST /api/payments/webhook` - Stripe webhook endpoint

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics (Admin only)
- `GET /api/admin/users` - Get all users (Admin only)
- `GET /api/admin/users/:id` - Get a single user (Admin only)
- `POST /api/admin/users` - Create a new admin user (Admin only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 