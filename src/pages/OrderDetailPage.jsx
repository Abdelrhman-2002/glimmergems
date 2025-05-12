import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Alert, Button, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authcontext';
import axios from 'axios';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Get token from localStorage for authorization
        const token = localStorage.getItem('token');
        
        // Make API request to get order details
        const response = await axios.get(
          `http://localhost/backend/jewerly_api/api/orders/read_one.php`,
          {
            params: { 
              id: orderId,
              user_id: currentUser.user_id  // For security, verify this is the user's order
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log('Order details response:', response.data);
        
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          setError(response.data.message || 'Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to fetch order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, currentUser]);

  // Check if user is logged in
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please log in to view order details.
        </Alert>
      </Container>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading order details...</p>
      </Container>
    );
  }

  // Show error if fetching failed
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
        </Alert>
        <div className="text-center mt-3">
          <Button variant="outline-primary" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </Container>
    );
  }

  // If order not found
  if (!order) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Order not found or you don't have permission to view it.
        </Alert>
        <div className="mt-3">
          <Button variant="outline-primary" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </Container>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'processing':
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'shipped':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Extract shipping address
  const shipping = order.shipping_address ? 
    (typeof order.shipping_address === 'string' ? 
      JSON.parse(order.shipping_address) : order.shipping_address) : {};

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Order #{order.order_id}</h1>
        <Button variant="outline-primary" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          {/* Order Items */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">Product #{item.product_id}</h6>
                      <small className="text-muted">Quantity: {item.quantity}</small>
                    </div>
                    <div className="text-end">
                      <span>${parseFloat(item.price).toFixed(2)} each</span>
                      <div className="fw-bold">
                        ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No items found for this order.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>

          {/* Shipping Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-1">
                <strong>Name:</strong> {shipping.first_name} {shipping.last_name}
              </p>
              <p className="mb-1">
                <strong>Address:</strong> {shipping.address}
              </p>
              <p className="mb-1">
                <strong>City:</strong> {shipping.city}, {shipping.state} {shipping.zip_code}
              </p>
              {shipping.phone && (
                <p className="mb-1">
                  <strong>Phone:</strong> {shipping.phone}
                </p>
              )}
              {shipping.email && (
                <p className="mb-0">
                  <strong>Email:</strong> {shipping.email}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Order Summary */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <strong>Order Date:</strong> {formatDate(order.created_at)}
              </p>
              <p className="mb-2">
                <strong>Order Status:</strong>{' '}
                <Badge bg={getStatusBadgeColor(order.order_status)}>
                  {order.order_status || 'Pending'}
                </Badge>
              </p>
              <p className="mb-2">
                <strong>Payment Status:</strong>{' '}
                <Badge bg={order.payment_status === 'completed' ? 'success' : 'warning'}>
                  {order.payment_status || 'Pending'}
                </Badge>
              </p>
              {order.payment_id && (
                <p className="mb-2">
                  <strong>Payment ID:</strong> {order.payment_id}
                </p>
              )}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${parseFloat(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>
                  {parseFloat(order.shipping || 0) === 0 ? 
                    <span className="text-success">Free</span> : 
                    `$${parseFloat(order.shipping || 0).toFixed(2)}`
                  }
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>${parseFloat(order.tax || 0).toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-0">
                <strong>Total:</strong>
                <strong>${parseFloat(order.total_amount || 0).toFixed(2)}</strong>
              </div>
            </Card.Body>
          </Card>

          {/* Actions */}
          <Card>
            <Card.Body>
              <h5 className="mb-3">Need Help?</h5>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" href="mailto:support@glimmergems.com">
                  Contact Support
                </Button>
                <Link to="/products" className="btn btn-primary">
                  Continue Shopping
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetailPage;