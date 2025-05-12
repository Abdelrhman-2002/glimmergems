import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faShoppingCart, 
  faBox, 
  faUsers,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }
        
        const response = await axios.get('http://localhost:3001/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  if (!stats) {
    return <Alert variant="info">No dashboard data available</Alert>;
  }
  
  // Format currency
  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toLocaleString('en-EG')} EGP`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Stats Overview */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary text-white rounded-circle p-3 me-3">
                <FontAwesomeIcon icon={faDollarSign} size="lg" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Revenue</h6>
                <h4 className="mb-0">{formatCurrency(stats.totalRevenue)}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success text-white rounded-circle p-3 me-3">
                <FontAwesomeIcon icon={faShoppingCart} size="lg" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Orders</h6>
                <h4 className="mb-0">{stats.totalOrders}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-info text-white rounded-circle p-3 me-3">
                <FontAwesomeIcon icon={faBox} size="lg" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Products</h6>
                <h4 className="mb-0">{stats.totalProducts}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning text-white rounded-circle p-3 me-3">
                <FontAwesomeIcon icon={faUsers} size="lg" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Users</h6>
                <h4 className="mb-0">{stats.totalUsers}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        {/* Recent Orders */}
        <Col lg={7} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Recent Orders</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => (
                    <tr key={order._id}>
                      <td>#{order._id.substring(0, 8)}</td>
                      <td>{order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}</td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>
                        <Badge bg={
                          order.status === 'completed' ? 'success' :
                          order.status === 'processing' ? 'primary' :
                          order.status === 'cancelled' ? 'danger' : 'warning'
                        }>
                          {order.status}
                        </Badge>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Recent Users */}
        <Col lg={5} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Recent Users</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Sales Chart */}
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Sales Last 7 Days
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.salesByDate.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Orders</th>
                      <th>Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.salesByDate.map((day, index) => (
                      <tr key={index}>
                        <td>{day._id}</td>
                        <td>{day.count}</td>
                        <td>{formatCurrency(day.totalSales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-0">No sales data available for the last 7 days</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 