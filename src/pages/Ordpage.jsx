import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/Authcontext';

const OrdersPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching orders for user:", currentUser);
        
        // API endpoint URL - direct to localhost with user_id
        const apiUrl = `http://localhost/backend/jewerly_api/api/orders/read_by_user.php?user_id=${currentUser.user_id}`;
        console.log("API URL:", apiUrl);
        
        // Make API request
        const response = await fetch(apiUrl);
        
        // Get response as text first for debugging
        const rawText = await response.text();
        console.log("Raw API response:", rawText);
        
        // Parse the JSON
        const data = JSON.parse(rawText);
        console.log("Parsed data:", data);
        
        if (data.success) {
          console.log("Orders retrieved:", data.orders);
          // Set the orders state with the array from response
          setOrders(data.orders || []);
        } else {
          console.error("API returned error:", data.message);
          setError(data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('Failed to fetch your orders. Please try again later.');
        setDebugInfo({
          errorMessage: err.message,
          userId: currentUser.user_id
        });
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
      
      {/* Display order data for debugging */}
      <details className="mt-5">
        <summary>Debug Order Data</summary>
        <pre className="mt-2" style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px',
          borderRadius: '5px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {JSON.stringify(orders, null, 2)}
        </pre>
      </details>
    </Container>
  );
};

export default OrdersPage;