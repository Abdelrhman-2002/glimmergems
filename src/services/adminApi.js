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

// Authentication
export const adminLogin = async (email, password) => {
  try {
    console.log('Login attempt with:', { email, password });
    const response = await adminApi.post('/users/login', { email, password });
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
    console.log('Orders API response:', response.data);
    
    // Transform response format to match component expectations
    return {
      success: response.data.success,
      records: response.data.orders.map(order => ({
        order_id: order._id,
        created: order.createdAt,
        customer_name: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
        customer_email: order.user?.email,
        total_amount: order.total,
        order_status: order.status,
        payment_status: order.paymentInfo?.status,
        payment_method: order.paymentInfo?.method,
        items: order.items
      }))
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrder = async (id) => {
  try {
    const response = await adminApi.get(`/orders/${id}`);
    console.log('Order details API response:', response.data);
    
    // Transform response format to match component expectations
    const order = response.data.order;
    if (!order) {
      return {
        success: false,
        message: 'Order not found'
      };
    }
    
    return {
      success: response.data.success,
      order: {
        order_id: order._id,
        created: order.createdAt,
        customer_name: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
        customer_email: order.user?.email,
        total_amount: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        order_status: order.status,
        payment_status: order.paymentInfo?.status,
        payment_method: order.paymentInfo?.method,
        shipping_address: order.shippingAddress,
        notes: order.notes
      },
      items: order.items.map(item => ({
        product_id: item.product?._id || item.product,
        product_name: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        image: item.product?.images?.[0] || ''
      }))
    };
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
    // Transform response format to match component expectations
    return {
      success: response.data.success,
      records: response.data.products || []
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (productId) => {
  try {
    const response = await adminApi.get(`/products/${productId}`);
    return {
      success: response.data.success,
      product: response.data.product || null
    };
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
    // Transform response format to match component expectations
    return {
      success: response.data.success,
      records: response.data.categories.map(cat => ({
        category_id: cat._id,
        name: cat.name,
        description: cat.description,
        image: cat.image,
        created: cat.createdAt
      }))
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await adminApi.post('/categories', {
      name: categoryData.name,
      description: categoryData.description,
      image: categoryData.image
    });
    return {
      success: response.data.success,
      category: response.data.category,
      message: 'Category created successfully'
    };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (categoryData) => {
  try {
    const response = await adminApi.put(`/categories/${categoryData.category_id}`, {
      name: categoryData.name,
      description: categoryData.description,
      image: categoryData.image
    });
    return {
      success: response.data.success,
      category: response.data.category,
      message: 'Category updated successfully'
    };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await adminApi.delete(`/categories/${categoryId}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Category deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Users
export const getUsers = async () => {
  try {
    const response = await adminApi.get('/admin/users');
    console.log('Users API response:', response.data);
    
    // Transform response format to match component expectations
    return {
      success: response.data.success,
      records: response.data.users.map(user => ({
        user_id: user._id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone,
        created: user.createdAt,
        order_count: user.orderCount || 0
      }))
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await adminApi.get(`/admin/users/${userId}`);
    console.log('User details API response:', response.data);
    
    // Transform response format to match component expectations
    const user = response.data.user;
    
    return {
      success: response.data.success,
      user: {
        user_id: user._id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone,
        created: user.createdAt,
        order_count: user.orderCount || 0,
        orders: user.orders?.map(order => ({
          _id: order._id,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items
        })) || []
      }
    };
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