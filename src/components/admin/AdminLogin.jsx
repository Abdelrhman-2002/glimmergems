import { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/Authcontext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { currentUser, login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if already logged in as admin
  if (currentUser && currentUser.role === 'admin') {
    navigate('/admin/dashboard');
    return null;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const response = await axios.post('http://localhost:3001/api/users/login', {
        email,
        password
      });
      
      if (response.data.success) {
        const userData = response.data.user;
        
        if (userData.role !== 'admin') {
          setError('Access denied. You do not have admin privileges.');
          setLoading(false);
          return;
        }
        
        // Store user data and token
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Navigate to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Failed to log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card>
            <Card.Header className="bg-dark text-white">
              <h4 className="mb-0">Admin Login</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="adminEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your admin email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="adminPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>
                
                <Button variant="dark" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login as Admin'}
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <p className="mb-0">
                <Link to="/" className="text-decoration-none">Return to Store</Link>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogin;