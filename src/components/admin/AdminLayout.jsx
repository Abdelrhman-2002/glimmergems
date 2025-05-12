import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, Button, Offcanvas, Image } from 'react-bootstrap';
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

// Admin Authentication Check Component
export const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_data');
    
    if (token && adminData) {
      setIsAuthenticated(true);
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
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [adminData, setAdminData] = useState(null);
  
  useEffect(() => {
    // Get admin data from localStorage
    const adminDataStr = localStorage.getItem('admin_data');
    if (adminDataStr) {
      try {
        const parsedData = JSON.parse(adminDataStr);
        setAdminData(parsedData);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
  }, []);
  
  const handleLogout = () => {
    // Clear admin authentication data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    
    // Redirect to login page
    navigate('/admin/login');
  };
  
  const closeSidebar = () => setShowSidebar(false);
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="admin-layout d-flex">
      {/* Mobile Navbar */}
      <Navbar bg="dark" variant="dark" expand={false} className="d-md-none">
        <Container fluid>
          <Navbar.Brand as={Link} to="/admin/dashboard">
            <FontAwesomeIcon icon={faGem} className="me-2" />
            Jewelry Admin
          </Navbar.Brand>
          <Navbar.Toggle 
            aria-controls="sidebar-nav" 
            onClick={() => setShowSidebar(true)}
          >
            <FontAwesomeIcon icon={faBars} />
          </Navbar.Toggle>
        </Container>
      </Navbar>
      
      {/* Sidebar for Mobile */}
      <Offcanvas 
        show={showSidebar} 
        onHide={closeSidebar} 
        placement="start" 
        responsive="md"
        className="sidebar bg-dark text-white"
        id="sidebar-nav"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="text-white">
            <FontAwesomeIcon icon={faGem} className="me-2" />
            Jewelry Admin
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <SidebarContent 
            adminData={adminData} 
            handleLogout={handleLogout} 
            isActive={isActive} 
            closeSidebar={closeSidebar}
          />
        </Offcanvas.Body>
      </Offcanvas>
      
      {/* Sidebar for Desktop */}
      <div className="sidebar bg-dark text-white d-none d-md-flex" style={{ width: '250px', position: 'fixed', height: '100vh' }}>
        <div className="d-flex flex-column w-100">
          <div className="p-3 border-bottom border-secondary">
            <h4 className="mb-0">
              <FontAwesomeIcon icon={faGem} className="me-2" />
              Jewelry Admin
            </h4>
          </div>
          <SidebarContent 
            adminData={adminData} 
            handleLogout={handleLogout} 
            isActive={isActive}
            closeSidebar={() => {}}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="content flex-grow-1" style={{ marginLeft: '0', paddingLeft: '0', paddingTop: '0', minHeight: '100vh' }}>
        <div className="d-none d-md-block" style={{ marginLeft: '250px' }}>
          <Navbar bg="white" className="shadow-sm py-2 px-4">
            <div className="d-flex align-items-center">
              <h5 className="mb-0">Welcome, {adminData?.first_name || 'Admin'}</h5>
            </div>
            <div className="ms-auto">
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </Button>
            </div>
          </Navbar>
          <div className="py-3 px-4">
            <Outlet />
          </div>
        </div>
        
        {/* Content for mobile */}
        <div className="d-block d-md-none">
          <div className="py-3 px-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
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