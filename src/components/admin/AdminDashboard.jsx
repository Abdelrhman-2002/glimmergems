// src/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, faBox, faUsers, faMoneyBillWave, 
  faExclamationTriangle, faChartLine, faEye, faTags,
  faCalendarAlt, faCheck, faSpinner, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { getOrders, getProducts, getUsers } from '../../services/adminApi';

// Format price to show EGP currency
const formatPrice = (price) => {
  return `${parseFloat(price || 0).toLocaleString('en-EG')} EGP`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch orders
      const ordersResponse = await getOrders();
      
      if (ordersResponse && ordersResponse.records) {
        const allOrders = ordersResponse.records;
        
        // Calculate order stats
        const totalOrders = allOrders.length;
        const pendingOrders = allOrders.filter(order => order.order_status === 'pending').length;
        const processingOrders = allOrders.filter(order => order.order_status === 'processing').length;
        const completedOrders = allOrders.filter(order => order.order_status === 'completed').length;
        const cancelledOrders = allOrders.filter(order => order.order_status === 'cancelled').length;
        
        // Calculate total revenue
        const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
        
        // Get recent orders
        const recent = [...allOrders]
          .sort((a, b) => new Date(b.created) - new Date(a.created))
          .slice(0, 5);
        
        setRecentOrders(recent);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalOrders,
          pendingOrders,
          processingOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue
        }));
      }
      
      // Fetch products
      const productsResponse = await getProducts();
      
      if (productsResponse && productsResponse.records) {
        const allProducts = productsResponse.records;
        
        // Find low stock products
        const lowStock = allProducts.filter(product => parseInt(product.stock) < 5);
        
        // Get unique categories
        const uniqueCategories = [...new Set(allProducts.map(product => product.category_id))];
        
        setLowStockProducts(lowStock);
        setStats(prev => ({
          ...prev,
          totalProducts: allProducts.length,
          totalCategories: uniqueCategories.length
        }));
      }
      
      // Fetch users
      const usersResponse = await getUsers();
      
      if (usersResponse && usersResponse.records) {
        setStats(prev => ({
          ...prev,
          totalCustomers: usersResponse.records.length
        }));
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return faCheck;
      case 'processing': return faSpinner;
      case 'pending': return faCalendarAlt;
      case 'cancelled': return faTimes;
      default: return faExclamationTriangle;
    }
  };
  
  // Extract customer name from order
  const getCustomerName = (order) => {
    if (order.customer_name) return order.customer_name;
    
    try {
      if (order.shipping_address) {
        const address = typeof order.shipping_address === 'string' 
          ? JSON.parse(order.shipping_address) 
          : order.shipping_address;
          
        if (address.first_name && address.last_name) {
          return `${address.first_name} ${address.last_name}`;
        }
      }
    } catch (err) {
      console.error('Error parsing shipping address:', err);
    }
    
    return 'Guest';
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard data...</p>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Dashboard</h1>
        <Button variant="outline-primary" onClick={fetchDashboardData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-primary" />
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Orders</h6>
                  <h3 className="fw-bold mb-0">{stats.totalOrders}</h3>
                </div>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="d-flex align-items-center">
                  <span className="badge bg-warning me-1">{stats.pendingOrders}</span> Pending
                </span>
                <span className="d-flex align-items-center">
                  <span className="badge bg-primary me-1">{stats.processingOrders}</span> Processing
                </span>
                <span className="d-flex align-items-center">
                  <span className="badge bg-success me-1">{stats.completedOrders}</span> Completed
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-success" />
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Revenue</h6>
                  <h3 className="fw-bold mb-0">{formatPrice(stats.totalRevenue)}</h3>
                </div>
              </div>
              <div className="small text-success">
                From {stats.totalOrders} orders
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                  <FontAwesomeIcon icon={faBox} className="text-info" />
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Products</h6>
                  <h3 className="fw-bold mb-0">{stats.totalProducts}</h3>
                </div>
              </div>
              <div className="small">
                {lowStockProducts.length > 0 ? (
                  <span className="text-warning">
                    {lowStockProducts.length} low stock items
                  </span>
                ) : (
                  <span className="text-success">
                    All products in stock
                  </span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} xl={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <FontAwesomeIcon icon={faUsers} className="text-warning" />
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Customers</h6>
                  <h3 className="fw-bold mb-0">{stats.totalCustomers}</h3>
                </div>
              </div>
              <div className="small">
                Registered users
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Main Content */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/admin/orders">
                <Button variant="outline-primary" size="sm">
                  View All
                </Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {recentOrders.length > 0 ? (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.order_id}>
                        <td>#{order.order_id}</td>
                        <td>{formatDate(order.created)}</td>
                        <td>{getCustomerName(order)}</td>
                        <td>{formatPrice(order.total_amount)}</td>
                        <td>
                          <Badge 
                            bg={getStatusBadgeVariant(order.order_status)}
                            className="d-flex align-items-center"
                            style={{ width: 'fit-content' }}
                          >
                            <FontAwesomeIcon icon={getStatusIcon(order.order_status)} className="me-1" />
                            {order.order_status}
                          </Badge>
                        </td>
                        <td>
                          <Link to={`/admin/orders/${order.order_id}`}>
                            <Button variant="outline-primary" size="sm">
                              <FontAwesomeIcon icon={faEye} className="me-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-muted mb-3" />
                  <p>No recent orders found.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">Low Stock Products</h5>
              <Link to="/admin/products">
                <Button variant="outline-primary" size="sm">
                  Manage
                </Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {lowStockProducts.length > 0 ? (
                <div className="list-group list-group-flush border-top">
                  {lowStockProducts.slice(0, 5).map(product => (
                    <div key={product.product_id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="me-2" 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="me-2 bg-light d-flex align-items-center justify-content-center" 
                                style={{ width: '40px', height: '40px', borderRadius: '4px' }}>
                              <FontAwesomeIcon icon={faBox} className="text-secondary" />
                            </div>
                          )}
                          <div>
                            <div className="mb-0 text-truncate" style={{ maxWidth: '150px' }}>{product.name}</div>
                            <small className="text-muted">{formatPrice(product.price)}</small>
                          </div>
                        </div>
                        <Badge bg={parseInt(product.stock) === 0 ? 'danger' : 'warning'}>
                          {product.stock} left
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <div className="list-group-item text-center">
                      <Link to="/admin/products" className="text-primary small">
                        View {lowStockProducts.length - 5} more...
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FontAwesomeIcon icon={faCheck} size="2x" className="text-success mb-3" />
                  <p>All products are well-stocked.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Quick Actions */}
      <h5 className="mt-4 mb-3">Quick Actions</h5>
      <Row className="g-4">
        <Col md={4}>
          <Link to="/admin/products" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100 hover-card">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <FontAwesomeIcon icon={faBox} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="mb-1">Products</h5>
                    <p className="mb-0 text-muted">Manage your product inventory</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={4}>
          <Link to="/admin/categories" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100 hover-card">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                    <FontAwesomeIcon icon={faTags} className="text-success" />
                  </div>
                  <div>
                    <h5 className="mb-1">Categories</h5>
                    <p className="mb-0 text-muted">Organize your product categories</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={4}>
          <Link to="/admin/customers" className="text-decoration-none">
            <Card className="border-0 shadow-sm h-100 hover-card">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                    <FontAwesomeIcon icon={faUsers} className="text-warning" />
                  </div>
                  <div>
                    <h5 className="mb-1">Customers</h5>
                    <p className="mb-0 text-muted">View and manage customer accounts</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
      
      {/* Add some CSS for hover effect */}
     
    </Container>
  );
};

export default AdminDashboard;