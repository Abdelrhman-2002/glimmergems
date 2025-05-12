import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import { getOrders, getOrder, updateOrderStatus } from '../../services/adminApi';

// Format price to show EGP currency
const formatPrice = (price) => {
  return `${parseFloat(price).toLocaleString('en-EG')} EGP`;
};

// Format date for better display
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      
      if (response.records) {
        setOrders(response.records);
      } else {
        setError('No orders found');
      }
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // View order details
  const handleViewOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await getOrder(orderId);
      
      if (response.order) {
        setCurrentOrder(response.order);
        setOrderItems(response.items || []);
        setShowOrderModal(true);
      } else {
        setError('Order details not found');
      }
    } catch (err) {
      setError('Failed to load order details. Please try again.');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await updateOrderStatus(orderId, status);
      
      if (response.success) {
        // Update order in the local state
        setOrders(orders.map(order => 
          order.order_id === orderId 
            ? { ...order, order_status: status } 
            : order
        ));
        
        // If the order details modal is open, update the current order
        if (currentOrder && currentOrder.order_id === orderId) {
          setCurrentOrder({ ...currentOrder, order_status: status });
        }
        
        setSuccessMessage('Order status updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.message || 'Failed to update order status');
      }
    } catch (err) {
      setError('Failed to update order status. Please try again.');
      console.error('Error updating order status:', err);
    }
  };

  // Filter orders based on status, search term and date range
  const filteredOrders = orders.filter(order => {
    // Status filter
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    
    // Search filter (by order ID or customer name if available)
    const matchesSearch = searchTerm === '' || 
      order.order_id.toString().includes(searchTerm) || 
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRange.from) {
      const orderDate = new Date(order.created);
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      if (orderDate < fromDate) {
        matchesDateRange = false;
      }
    }
    
    if (dateRange.to) {
      const orderDate = new Date(order.created);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      if (orderDate > toDate) {
        matchesDateRange = false;
      }
    }
    
    return matchesStatus && matchesSearch && matchesDateRange;
  });

  // Order status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2>Loading orders...</h2>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Order Management</h1>
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
      
      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Form.Group>
                <Form.Label><FontAwesomeIcon icon={faSearch} className="me-2" />Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by order ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Form.Group>
                <Form.Label><FontAwesomeIcon icon={faFilter} className="me-2" />Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col lg={3} md={6}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Orders Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.order_id}>
                    <td>#{order.order_id}</td>
                    <td>{formatDate(order.created)}</td>
                    <td>
                      {order.shipping_address ? (
                        <span>
                          {typeof order.shipping_address === 'string' 
                            ? JSON.parse(order.shipping_address).first_name + ' ' + JSON.parse(order.shipping_address).last_name
                            : order.shipping_address.first_name + ' ' + order.shipping_address.last_name
                          }
                        </span>
                      ) : (
                        order.customer_name || 'Guest'
                      )}
                    </td>
                    <td>{formatPrice(order.total_amount)}</td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(order.order_status)}>
                        {order.order_status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={order.payment_status === 'completed' ? 'success' : 'warning'}>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewOrder(order.order_id)}
                      >
                        <FontAwesomeIcon icon={faEye} className="me-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order #{currentOrder?.order_id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Order Information</h5>
                  <p className="mb-1"><strong>Date:</strong> {formatDate(currentOrder.created)}</p>
                  <p className="mb-1">
                    <strong>Status:</strong>{' '}
                    <Badge bg={getStatusBadgeVariant(currentOrder.order_status)}>
                      {currentOrder.order_status}
                    </Badge>
                  </p>
                  <p className="mb-1">
                    <strong>Payment Status:</strong>{' '}
                    <Badge bg={currentOrder.payment_status === 'completed' ? 'success' : 'warning'}>
                      {currentOrder.payment_status}
                    </Badge>
                  </p>
                  {currentOrder.payment_id && (
                    <p className="mb-1"><strong>Payment ID:</strong> {currentOrder.payment_id}</p>
                  )}
                </Col>
                <Col md={6}>
                  <h5>Customer Information</h5>
                  {currentOrder.shipping_address && (
                    <>
                      {typeof currentOrder.shipping_address === 'string' ? (
                        (() => {
                          const address = JSON.parse(currentOrder.shipping_address);
                          return (
                            <>
                              <p className="mb-1"><strong>Name:</strong> {address.first_name} {address.last_name}</p>
                              <p className="mb-1"><strong>Email:</strong> {address.email}</p>
                              <p className="mb-1"><strong>Phone:</strong> {address.phone || 'N/A'}</p>
                              <p className="mb-1">
                                <strong>Address:</strong> {address.address}, {address.city}, {address.state}, {address.zip_code}
                              </p>
                            </>
                          );
                        })()
                      ) : (
                        <>
                          <p className="mb-1">
                            <strong>Name:</strong> {currentOrder.shipping_address.first_name} {currentOrder.shipping_address.last_name}
                          </p>
                          <p className="mb-1"><strong>Email:</strong> {currentOrder.shipping_address.email}</p>
                          <p className="mb-1"><strong>Phone:</strong> {currentOrder.shipping_address.phone || 'N/A'}</p>
                          <p className="mb-1">
                            <strong>Address:</strong> {currentOrder.shipping_address.address}, {currentOrder.shipping_address.city}, 
                            {currentOrder.shipping_address.state}, {currentOrder.shipping_address.zip_code}
                          </p>
                        </>
                      )}
                    </>
                  )}
                </Col>
              </Row>
              
              <h5>Order Items</h5>
              <Table responsive className="mt-3">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.length > 0 ? (
                    orderItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                className="me-2"
                              />
                            )}
                            <div>
                              <p className="mb-0">{item.name || 'Product Name'}</p>
                              {item.product_id && (
                                <small className="text-muted">ID: {item.product_id}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">No items found</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                    <td className="text-end">{formatPrice(currentOrder.subtotal || 0)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Shipping:</strong></td>
                    <td className="text-end">
                      {currentOrder.shipping === 0 
                        ? <span className="text-success">Free</span> 
                        : formatPrice(currentOrder.shipping || 0)
                      }
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Tax:</strong></td>
                    <td className="text-end">{formatPrice(currentOrder.tax || 0)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                    <td className="text-end">{formatPrice(currentOrder.total_amount)}</td>
                  </tr>
                </tfoot>
              </Table>
              
              <div className="mt-4">
                <h5>Update Order Status</h5>
                <div className="d-flex mt-2">
                  <Button
                    variant={currentOrder.order_status === 'pending' ? 'warning' : 'outline-warning'}
                    className="me-2"
                    disabled={currentOrder.order_status === 'pending'}
                    onClick={() => handleUpdateStatus(currentOrder.order_id, 'pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={currentOrder.order_status === 'processing' ? 'primary' : 'outline-primary'}
                    className="me-2"
                    onClick={() => handleUpdateStatus(currentOrder.order_id, 'processing')}
                  >
                    Processing
                  </Button>
                  <Button
                    variant={currentOrder.order_status === 'completed' ? 'success' : 'outline-success'}
                    className="me-2"
                    onClick={() => handleUpdateStatus(currentOrder.order_id, 'completed')}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={currentOrder.order_status === 'cancelled' ? 'danger' : 'outline-danger'}
                    onClick={() => handleUpdateStatus(currentOrder.order_id, 'cancelled')}
                  >
                    Cancelled
                  </Button>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderManagement;