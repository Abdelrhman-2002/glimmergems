import axios from 'axios';

// Use the Node.js backend URL
const API_URL = 'http://localhost:3001/api';

// Create axios instance with the backend URL
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
export const getProducts = async (categoryId = null, minPrice = null, maxPrice = null, search = null) => {
  try {
    // Start with base URL
    let url = '/products';
    
    // Add query parameters
    const params = new URLSearchParams();
    
    if (categoryId) params.append('category', categoryId);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);
    
    // Make sure search parameter is properly handled
    if (search && search.trim()) {
      params.append('search', search.trim());
      console.log('API service: Adding search param:', search.trim());
    }
    
    // Append params to URL if any exist
    if (params.toString()) {
      url = `${url}?${params.toString()}`;
    }
    
    console.log('API Request URL:', url);
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

// Category API functions
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Auth API functions
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response && error.response.data) {
      throw { 
        message: error.response.data.message || 'Login failed',
        response: error.response
      };
    }
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response && error.response.data) {
      throw { 
        message: error.response.data.message || 'Registration failed',
        response: error.response
      };
    }
    throw error;
  }
};

// Stripe payment functions
export const createPaymentIntent = async (amount) => {
  try {
    const response = await api.post('/payments/create-intent', { amount });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId) => {
  try {
    const response = await api.post('/payments/confirm', {
      paymentIntentId
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
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Order functions - add these to your api.js file
export const getUserOrders = async () => {
  try {
    const response = await api.get('/orders/myorders');
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export default api;