# GlimmerGems Jewelry Store

A modern e-commerce platform for a jewelry store built with React.js, Node.js, Express, and MongoDB.

## Features

- User authentication and account management
- Product browsing with search and filtering
- Shopping cart functionality
- Secure checkout process
- Responsive design for all devices
- Admin dashboard for inventory management

## Tech Stack

### Frontend
- React.js
- React Router
- React Bootstrap
- Context API for state management
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Setup and Running

1. Clone the repository
```bash
git clone https://github.com/yourusername/glimmergems.git
cd glimmergems
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3001
```

4. Run the application
```bash
# Run backend (from the backend directory)
npm run start

# Run frontend (from the root directory)
npm run dev
```

5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## Project Structure

```
jewerly-store/
├── backend/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── server.js        # Server entry point
│   └── package.json
├── src/                     # Frontend React application
│   ├── components/          # Reusable components
│   ├── contexts/            # React context providers
│   ├── pages/               # Page components
│   ├── layouts/             # Layout components
│   ├── services/            # API services
│   ├── auth/                # Authentication components
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
└── package.json
```

## License

MIT License
