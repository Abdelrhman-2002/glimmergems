import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import AuthContext, { useAuth } from '../contexts/Authcontext'; // Changed import
import { CartContext } from '../contexts/Cartcontext';

const NavbarComponent = () => {
  // Option 1: Use the useAuth hook (recommended)
  const { currentUser: user, logout } = useAuth();
  
  // Option 2: Or keep using useContext if preferred
  // const { currentUser: user, logout } = useContext(AuthContext);
  
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="custom-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">GlimmerGems</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <NavDropdown title="Collections" id="collections-dropdown">
              <NavDropdown.Item as={Link} to="/products?category=1">Rings</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=2">Necklaces</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=3">Earrings</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=4">Bracelets</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products">All Jewelry</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/cart">
              <FontAwesomeIcon icon={faShoppingCart} />
              {totalItems > 0 && (
                <Badge bg="primary" pill className="ms-1">
                  {totalItems}
                </Badge>
              )}
            </Nav.Link>
            {user ? (
              <NavDropdown title={<><FontAwesomeIcon icon={faUser} /> {user.first_name}</>} id="user-dropdown" align="end">
                <NavDropdown.Item as={Link} to="/profile">My Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                {user.role === 'admin' && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin">Admin Panel</NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;