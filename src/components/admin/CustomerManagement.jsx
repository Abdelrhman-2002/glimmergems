// src/admin/CustomerManagement.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Modal, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faUser, faEnvelope, faPhone, 
  faCalendarAlt, faEye, faShoppingCart, faSortAlphaDown,
  faSortAlphaUp, faSortNumericDown, faSortNumericUp
} from '@fortawesome/free-solid-svg-icons';
import { getUsers, getUser } from '../../services/adminApi';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);
  const [sortField, setSortField] = useState('created');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // Filter customers when search term changes
  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers, sortField, sortDirection]);
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching customers...');
      const response = await getUsers();
      console.log('Response from getUsers:', response);
      
      if (response && response.records) {
        console.log('Setting customers:', response.records);
        setCustomers(response.records);
        setFilteredCustomers(response.records);
      } else {
        console.error('No records found in response:', response);
        setError('No customers found or error fetching customers.');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(`Failed to load customers: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const filterCustomers = () => {
    if (!customers || customers.length === 0) {
      console.log('No customers to filter');
      setFilteredCustomers([]);
      return;
    }
    
    let filtered = [...customers];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        (customer.first_name && customer.first_name.toLowerCase().includes(search)) ||
        (customer.last_name && customer.last_name.toLowerCase().includes(search)) ||
        (customer.email && customer.email.toLowerCase().includes(search)) ||
        (customer.phone && customer.phone.toLowerCase().includes(search))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let fieldA = a[sortField] || '';
      let fieldB = b[sortField] || '';
      
      // Handle string vs number sorting
      if (sortField === 'created' || sortField === 'order_count') {
        // For dates and numeric fields
        fieldA = fieldA ? (sortField === 'created' ? new Date(fieldA) : parseFloat(fieldA)) : 0;
        fieldB = fieldB ? (sortField === 'created' ? new Date(fieldB) : parseFloat(fieldB)) : 0;
      } else {
        // For string fields
        fieldA = fieldA.toString().toLowerCase();
        fieldB = fieldB.toString().toLowerCase();
      }
      
      // Sort in the appropriate direction
      if (sortDirection === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });
    
    console.log('Filtered customers:', filtered.length);
    setFilteredCustomers(filtered);
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    
    if (field === 'created' || field === 'order_count') {
      // Numeric fields
      return sortDirection === 'asc' 
        ? <FontAwesomeIcon icon={faSortNumericDown} className="ms-1" /> 
        : <FontAwesomeIcon icon={faSortNumericUp} className="ms-1" />;
    } else {
      // String fields
      return sortDirection === 'asc' 
        ? <FontAwesomeIcon icon={faSortAlphaDown} className="ms-1" /> 
        : <FontAwesomeIcon icon={faSortAlphaUp} className="ms-1" />;
    }
  };
  
  const viewCustomerDetails = async (customerId) => {
    try {
      setCustomerDetailLoading(true);
      setError('');
      
      console.log('Fetching customer details:', customerId);
      const response = await getUser(customerId);
      console.log('Customer details response:', response);
      
      if (response && response.user) {
        setCurrentCustomer(response.user);
        setShowCustomerModal(true);
      } else {
        console.error('No user data found in response:', response);
        setError('Failed to load customer details.');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError(`Failed to load customer details: ${err.message || 'Unknown error'}`);
    } finally {
      setCustomerDetailLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Customer Management</h1>
      </div>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Search and Filter Bar */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
              <Button 
                variant="outline-secondary" 
                onClick={fetchCustomers}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh List'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Customers Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading customers...</p>
            </div>
          ) : filteredCustomers && filteredCustomers.length > 0 ? (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th className="cursor-pointer" onClick={() => handleSort('user_id')}>
                    ID {getSortIcon('user_id')}
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('first_name')}>
                    Name {getSortIcon('first_name')}
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('email')}>
                    Email {getSortIcon('email')}
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('phone')}>
                    Phone {getSortIcon('phone')}
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('created')}>
                    Registered {getSortIcon('created')}
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('order_count')}>
                    Orders {getSortIcon('order_count')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.user_id}>
                    <td>{customer.user_id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle d-flex justify-content-center align-items-center me-2" 
                             style={{ width: '36px', height: '36px' }}>
                          <FontAwesomeIcon icon={faUser} className="text-secondary" />
                        </div>
                        {customer.first_name} {customer.last_name}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faEnvelope} className="text-muted me-2" />
                        {customer.email}
                      </div>
                    </td>
                    <td>
                      {customer.phone ? (
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faPhone} className="text-muted me-2" />
                          {customer.phone}
                        </div>
                      ) : (
                        <span className="text-muted">Not provided</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-muted me-2" />
                        {formatDate(customer.created)}
                      </div>
                    </td>
                    <td>
                      <Badge bg={customer.order_count > 0 ? 'primary' : 'secondary'} pill>
                        {customer.order_count || 0}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => viewCustomerDetails(customer.user_id)}
                        disabled={customerDetailLoading}
                      >
                        <FontAwesomeIcon icon={faEye} className="me-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <FontAwesomeIcon icon={faUser} size="3x" className="text-muted mb-3" />
              <p className="mb-0">No customers found.</p>
              {searchTerm && (
                <p className="text-muted">
                  Try adjusting your search criteria.
                </p>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Customer Detail Modal */}
      <Modal 
        show={showCustomerModal} 
        onHide={() => setShowCustomerModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Customer Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!currentCustomer ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading customer details...</p>
            </div>
          ) : (
            <>
              <Row className="mb-4">
                <Col md={4} className="mb-3 mb-md-0">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <div 
                        className="bg-light rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3" 
                        style={{ width: '80px', height: '80px' }}
                      >
                        <FontAwesomeIcon icon={faUser} size="2x" className="text-secondary" />
                      </div>
                      <h5>{currentCustomer.first_name} {currentCustomer.last_name}</h5>
                      <p className="text-muted mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        {currentCustomer.email}
                      </p>
                      {currentCustomer.phone && (
                        <p className="text-muted">
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          {currentCustomer.phone}
                        </p>
                      )}
                    </Card.Body>
                    <Card.Footer className="bg-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                          Joined: {formatDate(currentCustomer.created)}
                        </small>
                        <Badge bg="primary" pill>
                          {currentCustomer.order_count || 0} Orders
                        </Badge>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
                <Col md={8}>
                  <Card className="h-100">
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">Customer Orders</h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {currentCustomer.orders && currentCustomer.orders.length > 0 ? (
                        <Table responsive hover className="mb-0">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Date</th>
                              <th>Total</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentCustomer.orders.map(order => (
                              <tr key={order._id}>
                                <td>#{order._id.substring(0, 8)}</td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>${parseFloat(order.total).toFixed(2)}</td>
                                <td>
                                  <Badge 
                                    bg={
                                      order.status === 'completed' ? 'success' :
                                      order.status === 'processing' ? 'primary' :
                                      order.status === 'cancelled' ? 'danger' : 'warning'
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <div className="text-center py-4">
                          <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-muted mb-3" />
                          <p className="mb-0">No orders found for this customer.</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <Card>
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">Additional Information</h5>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-0 text-muted">
                        This section can contain additional information about the customer
                        such as addresses, preferences, or marketing statistics.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomerModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Add some CSS for the cursor pointer on sortable columns */}
      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default CustomerManagement;