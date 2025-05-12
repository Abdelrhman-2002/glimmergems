import axios from 'axios';

// Base API URL for admin endpoints
const API_URL = 'http://localhost:3001/api';

// Create admin API instance with authentication interceptor
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
adminApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Authentication
export const adminLogin = async (email, password) => {
  try {
    console.log('Login attempt with:', { email, password });
    const response = await adminApi.post('/admin/login', { email, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};

// Dashboard Data
export const getOrderStats = async () => {
  try {
    const response = await adminApi.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};

// Orders
export const getOrders = async (params = {}) => {
  try {
    const response = await adminApi.get('/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrder = async (id) => {
  try {
    const response = await adminApi.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await adminApi.put(`/orders/${orderId}/status`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Products
export const getProducts = async (params = {}) => {
  try {
    const response = await adminApi.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (productId) => {
  try {
    const response = await adminApi.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await adminApi.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productData) => {
  try {
    const response = await adminApi.put(`/products/${productData._id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await adminApi.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const updateProductStock = async (productId, stock) => {
  try {
    const response = await adminApi.put(`/products/${productId}/stock`, {
      stock
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

// Categories
export const getCategories = async () => {
  try {
    const response = await adminApi.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await adminApi.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (categoryData) => {
  try {
    const response = await adminApi.put(`/categories/${categoryData._id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await adminApi.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Users
export const getUsers = async () => {
  try {
    const response = await adminApi.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await adminApi.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

// Reports
export const getSalesReport = async (params) => {
  try {
    const response = await adminApi.get('/admin/dashboard', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

export const getProductPerformanceReport = async (params) => {
  try {
    const response = await adminApi.get('/admin/reports/product_performance.php', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching product performance:', error);
    throw error;
  }
};

export default adminApi;