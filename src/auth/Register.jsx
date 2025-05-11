import { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/Authcontext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Remove confirm_password before sending to API
      const { confirm_password, ...registrationData } = formData;
      
      await register(registrationData);
      navigate('/');
    } catch (err) {
      setError('Failed to create an account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Create an Account</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="first_name">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="first_name"
                        value={formData.first_name} 
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="last_name">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="last_name"
                        value={formData.last_name} 
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="password"
                    value={formData.password} 
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="confirm_password">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="confirm_password"
                    value={formData.confirm_password} 
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register'}
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <p className="mb-0">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;