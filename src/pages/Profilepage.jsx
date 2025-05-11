import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';
import { useAuth } from '../contexts/Authcontext'; // Import useAuth hook instead

const ProfilePage = () => {
  // Use the useAuth hook to access currentUser
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form data when user data is available
  useEffect(() => {
    if (currentUser) {
      setFormData(prevData => ({
        ...prevData,
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zip_code: currentUser.zip_code || '',
        phone: currentUser.phone || ''
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    // Simulate API call to update profile
    setTimeout(() => {
      setMessage('Profile updated successfully!');
      setLoading(false);
    }, 1000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validate passwords
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    // Simulate API call to update password
    setTimeout(() => {
      setMessage('Password updated successfully!');
      setFormData({
        ...formData,
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setLoading(false);
    }, 1000);
  };

  // Check if user is logged in
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">My Account</h1>

      <Row>
        <Col md={3} className="mb-4">
          <Card>
            <Card.Body>
              <Nav variant="pills" className="flex-column" activeKey={activeTab}
                onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                <Nav.Item>
                  <Nav.Link eventKey="profile">Personal Information</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="password">Change Password</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="address">Address Book</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="orders">Order History</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {activeTab === 'profile' && (
            <Card>
              <Card.Header>
                <h4 className="mb-0">Personal Information</h4>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleProfileSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card>
              <Card.Header>
                <h4 className="mb-0">Change Password</h4>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                  </Form.Group>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'address' && (
            <Card>
              <Card.Header>
                <h4 className="mb-0">Address Book</h4>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Row>
                    <Col md={5}>
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>ZIP Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="zip_code"
                          value={formData.zip_code}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button 
                    type="submit" 
                    variant="primary"
                  >
                    Save Address
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'orders' && (
            <Card>
              <Card.Header>
                <h4 className="mb-0">Order History</h4>
              </Card.Header>
              <Card.Body>
                <Alert variant="info">
                  You don't have any orders yet. <a href="/products">Continue shopping</a>
                </Alert>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;