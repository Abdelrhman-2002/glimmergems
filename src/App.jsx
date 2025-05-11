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

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
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

            </Routes>
          </main>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;