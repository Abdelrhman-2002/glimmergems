import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, Button, Offcanvas, Image, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faBox,
  faShoppingCart,
  faUsers,
  faTags,
  faChartLine,
  faSignOutAlt,
  faBars,
  faGem
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/Authcontext';

// Admin Authentication Check Component
export const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData && userData.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          navigate('/admin/login', { state: { from: location } });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/admin/login', { state: { from: location } });
      }
    } else {
      // Redirect to login page if not authenticated
      navigate('/admin/login', { state: { from: location } });
    }
    
    setLoading(false);
  }, [navigate, location]);
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h2>Loading...</h2>
      </Container>
    );
  }
  
  // If authenticated, render the child components
  return isAuthenticated ? children : null;
};

// Admin Layout Component
const AdminLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [adminData, setAdminData] = useState(null);
  
  useEffect(() => {
    // Get admin data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedData = JSON.parse(userStr);
        setAdminData(parsedData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  
  const closeSidebar = () => setShowSidebar(false);
  
  // Check if a specific nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <Container fluid className="px-0">
      <Row className="g-0">
        {/* Sidebar */}
        <Col md={3} lg={2} className="bg-dark text-white min-vh-100 py-4">
          <div className="text-center mb-4">
            <h3 className="fw-bold">Admin Panel</h3>
          </div>
          
          <Nav className="flex-column">
            <Nav.Link 
              as={Link} 
              to="/admin/dashboard" 
              className={`mb-2 ps-4 ${isActive('/admin/dashboard') ? 'active bg-primary rounded' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
              Dashboard
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/admin/products" 
              className={`mb-2 ps-4 ${isActive('/admin/products') ? 'active bg-primary rounded' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faBox} className="me-2" />
              Products
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/admin/categories" 
              className={`mb-2 ps-4 ${isActive('/admin/categories') ? 'active bg-primary rounded' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faTags} className="me-2" />
              Categories
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/admin/orders" 
              className={`mb-2 ps-4 ${isActive('/admin/orders') ? 'active bg-primary rounded' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
              Orders
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/admin/customers" 
              className={`mb-2 ps-4 ${isActive('/admin/customers') ? 'active bg-primary rounded' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              Customers
            </Nav.Link>
            
            <div className="mt-5 ps-4">
              <Button 
                variant="outline-light" 
                className="w-100 d-flex align-items-center" 
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </Button>
            </div>
          </Nav>
        </Col>
        
        {/* Main content */}
        <Col md={9} lg={10} className="p-4">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

// Sidebar Content Component
const SidebarContent = ({ adminData, handleLogout, isActive, closeSidebar }) => {
  return (
    <>
      {adminData && (
        <div className="p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle p-2 me-2">
              <span className="fw-bold text-white">
                {adminData.first_name?.[0]}{adminData.last_name?.[0]}
              </span>
            </div>
            <div>
              <p className="mb-0 text-white">{adminData.first_name} {adminData.last_name}</p>
              <small className="text-white-50">{adminData.email}</small>
            </div>
          </div>
        </div>
      )}
      
      <Nav className="flex-column mt-2">
        <Nav.Link 
          as={Link} 
          to="/admin/dashboard" 
          className={`px-3 py-2 ${isActive('/admin/dashboard') ? 'active bg-primary' : ''}`}
          onClick={closeSidebar}
        >
          <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
          Dashboard
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/products" 
          className={`px-3 py-2 ${isActive('/admin/products') ? 'active bg-primary' : ''}`}
          onClick={closeSidebar}
        >
          <FontAwesomeIcon icon={faBox} className="me-2" />
          Products
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/categories" 
          className={`px-3 py-2 ${isActive('/admin/categories') ? 'active bg-primary' : ''}`}
          onClick={closeSidebar}
        >
          <FontAwesomeIcon icon={faTags} className="me-2" />
          Categories
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/orders" 
          className={`px-3 py-2 ${isActive('/admin/orders') ? 'active bg-primary' : ''}`}
          onClick={closeSidebar}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
          Orders
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/customers" 
          className={`px-3 py-2 ${isActive('/admin/customers') ? 'active bg-primary' : ''}`}
          onClick={closeSidebar}
        >
          <FontAwesomeIcon icon={faUsers} className="me-2" />
          Customers
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/reports" 
          className={`px-3 py-2 ${isActive('/admin/reports') ? 'active bg-primary' : ''}`}
          onClick={closeSidebar}
        >
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          Reports
        </Nav.Link>
        <div className="mt-auto border-top border-secondary pt-2 mt-2">
          <Nav.Link 
            onClick={handleLogout}
            className="px-3 py-2 text-danger"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Logout
          </Nav.Link>
        </div>
      </Nav>
    </>
  );
};

export default AdminLayout;