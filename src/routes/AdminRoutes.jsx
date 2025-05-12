import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminLayout, { AdminProtectedRoute } from './components/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import ProductManagement from './components/ProductManagement';
import OrderManagement from './components/OrderManagement';
import CategoryManagement from './components/CategoryManagement';
import CustomerManagement from './components/CustomerManagement';
import ReportsPage from './components/ReportsPage';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Public route - Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }>
        {/* Dashboard */}
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* Products */}
        <Route path="products" element={<ProductManagement />} />
        
        {/* Categories */}
        <Route path="categories" element={<CategoryManagement />} />
        
        {/* Orders */}
        <Route path="orders" element={<OrderManagement />} />
        
        {/* Customers */}
        <Route path="customers" element={<CustomerManagement />} />
        
        {/* Reports */}
        <Route path="reports" element={<ReportsPage />} />
        
        {/* Default redirect */}
        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;