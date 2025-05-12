import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Badge, Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import AuthContext, { useAuth } from '../contexts/Authcontext';
import { CartContext } from '../contexts/Cartcontext';
import { getCategories } from '../services/api';

const NavbarComponent = () => {
  // Option 1: Use the useAuth hook (recommended)
  const { currentUser: user, logout } = useAuth();
  
  // Option 2: Or keep using useContext if preferred
  // const { currentUser: user, logout } = useContext(AuthContext);
  
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.categories) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Log the search term for debugging
      console.log('Searching for:', searchTerm.trim());
      
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      
      // Clear the search field
      setSearchTerm('');
    }
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
              {categories.map(category => (
                <NavDropdown.Item 
                  key={category._id} 
                  as={Link} 
                  to={`/products?category=${category._id}`}
                >
                  {category.name}
                </NavDropdown.Item>
              ))}
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products">All Jewelry</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          
          <Form className="d-flex mx-auto my-2 my-lg-0" onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Search jewelry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search"
                className="me-2"
                style={{ maxWidth: '200px' }}
              />
              <Button variant="outline-light" type="submit">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </InputGroup>
          </Form>
          
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
              <NavDropdown title={<><FontAwesomeIcon icon={faUser} /> {user.firstName || 'User'}</>} id="user-dropdown" align="end">
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