import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/Authcontext';
import { CartProvider } from './contexts/Cartcontext';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import HomePage from './pages/Home';
import ProductsPage from './pages/Prodpage';
import ProductDetailPage from './pages/Proddetail';
import CartPage from './pages/Cartpage';
import CheckoutPage from './pages/Checkout';
import OrderSuccessPage from './pages/OrdSuccess';
import LoginPage from './auth/Login';
import RegisterPage from './auth/Register';
import ProfilePage from './pages/Profilepage';
import OrdersPage from './pages/Ordpage';
import OrderDetailPage from './pages/OrderDetailPage';

// Import Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductManagement from './components/admin/ProductManagement';
import OrderManagement from './components/admin/OrderManagement';
import CategoryManagement from './components/admin/CategoryManagement';
import CustomerManagement from './components/admin/CustomerManagement';
import { AdminProtectedRoute } from './components/admin/AdminLayout';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Render Navbar only for non-admin routes */}
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<Navbar />} />
          </Routes>
          
          <main>
            <Routes>
              {/* Customer-facing routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/order/:orderId" element={<OrderDetailPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </main>
          
          {/* Render Footer only for non-admin routes */}
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<Footer />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;