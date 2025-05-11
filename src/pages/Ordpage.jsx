import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/Authcontext';
import axios from 'axios';

const OrdersPage = () => {
  // Use the useAuth hook to access currentUser
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  // Fetch orders when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching orders for user:", currentUser);
        
        // Get token from localStorage for authorization
        const token = localStorage.getItem('token');
        console.log("Token available:", !!token);
        
        // API endpoint URL - make sure this matches your actual backend path
        const apiUrl = 'http://localhost/backend/jewerly_api/api/orders/read_by_user.php';
        console.log("API URL:", apiUrl);
        
        // Make API request to get user's orders
        const response = await axios.get(apiUrl, {
          params: { user_id: currentUser.user_id },
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Orders API full response:', response);
        
        if (response.data.success) {
          console.log('Orders retrieved:', response.data.orders);
          setOrders(response.data.orders || []);
        } else {
          console.error('API returned error:', response.data.message);
          setError(response.data.message || 'Failed to fetch orders');
          setDebugInfo({
            responseData: response.data,
            endpoint: apiUrl,
            userId: currentUser.user_id
          });
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        // Store detailed error information for debugging
        setDebugInfo({
          errorMessage: err.message,
          errorResponse: err.response?.data,
          errorStatus: err.response?.status,
          endpoint: 'http://localhost/backend/jewerly_api/api/orders/read_by_user.php',
          userId: currentUser.user_id
        });
        
        setError('Failed to fetch your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Check if user is logged in
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please log in to view your orders.
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
        <p className="mt-3">Loading your orders...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">My Orders</h1>
      
      {/* Show error with debug information for troubleshooting */}
      {error && (
        <Alert variant="danger">
          <p>{error}</p>
          {debugInfo && (
            <div className="mt-3">
              <details>
                <summary>Debug Information (for developers)</summary>
                <pre className="mt-2" style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px',
                  borderRadius: '5px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </Alert>
      )}
            
      {!error && orders.length > 0 ? (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.order_id}>
                <td>#{order.order_id}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <Badge bg={
                    order.order_status === 'delivered' ? 'success' :
                    order.order_status === 'processing' ? 'warning' :
                    order.order_status === 'cancelled' ? 'danger' : 'info'
                  }>
                    {order.order_status || 'Pending'}
                  </Badge>
                </td>
                <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                <td>
                  <Link to={`/order/${order.order_id}`}>
                    <Button variant="outline-primary" size="sm">View</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : !error && (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-shopping-bag fa-4x text-muted"></i>
          </div>
          <h3>No Orders Yet</h3>
          <p className="text-muted">You haven't placed any orders yet.</p>
          <Link to="/products">
            <Button variant="primary" className="mt-3">Start Shopping</Button>
          </Link>
        </div>
      )}
      
      {/* Display user info for debugging */}
      <details className="mt-5">
        <summary>User Information (for debugging)</summary>
        <pre className="mt-2" style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px',
          borderRadius: '5px' 
        }}>
          {JSON.stringify(currentUser, null, 2)}
        </pre>
      </details>
    </Container>
  );
};

export default OrdersPage;