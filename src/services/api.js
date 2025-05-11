import axios from 'axios';

// Add CORS proxy to your API URL
const API_URL = 'https://api.allorigins.win/raw?url=https://jewerly-api.rf.gd/api';

// Rest of your code remains the same
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Product API functions
export const getProducts = async (categoryId = null) => {
  try {
    const url = categoryId ? `/products/read.php?category_id=${categoryId}` : '/products/read.php';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/read_one.php?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

// Category API functions
export const getCategories = async () => {
  try {
    const response = await api.get('/categories/read.php');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Auth API functions
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login.php', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register.php', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Stripe payment functions
export const createPaymentIntent = async (amount) => {
  try {
    const response = await api.post('/payments/create_intent.php', { amount });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId) => {
  try {
    const response = await api.post('/payments/confirm_payment.php', {
      payment_intent_id: paymentIntentId
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Order functions
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders/create.php', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export default api;