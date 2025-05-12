// src/admin/CustomerManagement.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Modal, Spinner } from 'react-bootstrap';
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
      
      const response = await getUsers();
      
      if (response && response.records) {
        setCustomers(response.records);
      } else {
        setError('No customers found or error fetching customers.');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const filterCustomers = () => {
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
      
      const response = await getUser(customerId);
      
      if (response && response.user) {
        setCurrentCustomer(response.user);
        setShowCustomerModal(true);
      } else {
        setError('Failed to load customer details.');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError('Failed to load customer details. Please try again.');
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
        <div className="alert alert-danger mb-4">
          {error}
        </div>
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
          ) : filteredCustomers.length > 0 ? (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th className="cursor-pointer" onClick={() => handleSort('user_id')}>
                    ID {getSortIcon('user_id')}
                  </th><th className="cursor-pointer" onClick={() => handleSort('first_name')}>
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
                      <Badge bg={
                        !customer.order_count ? 'secondary' :
                        parseInt(customer.order_count) > 5 ? 'success' : 'primary'
                      }>
                        {customer.order_count || 0}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
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
              <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted mb-3" />
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
      
      {/* Customer Details Modal */}
      <Modal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentCustomer ? (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Personal Information</h5>
                  <Table>
                    <tbody>
                      <tr>
                        <td className="fw-bold">Customer ID</td>
                        <td>{currentCustomer.user_id}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Name</td>
                        <td>{currentCustomer.first_name} {currentCustomer.last_name}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Email</td>
                        <td>{currentCustomer.email}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Phone</td>
                        <td>{currentCustomer.phone || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Registered</td>
                        <td>{formatDate(currentCustomer.created)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Address Information</h5>
                  <Table>
                    <tbody>
                      <tr>
                        <td className="fw-bold">Address</td>
                        <td>{currentCustomer.address || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">City</td>
                        <td>{currentCustomer.city || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">State</td>
                        <td>{currentCustomer.state || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">ZIP Code</td>
                        <td>{currentCustomer.zip_code || 'Not provided'}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              <h5 className="mb-3">
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                Order History
              </h5>
              
              {currentCustomer.orders && currentCustomer.orders.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCustomer.orders.map(order => (
                      <tr key={order.order_id}>
                        <td>#{order.order_id}</td>
                        <td>{formatDate(order.created)}</td>
                        <td>
                          {new Intl.NumberFormat('en-EG', {
                            style: 'currency',
                            currency: 'EGP'
                          }).format(order.total_amount)}
                        </td>
                        <td>
                          <Badge bg={
                            order.order_status === 'completed' ? 'success' :
                            order.order_status === 'processing' ? 'primary' :
                            order.order_status === 'pending' ? 'warning' :
                            'danger'
                          }>
                            {order.order_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-3 bg-light rounded">
                  <p className="mb-0 text-muted">No order history available.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading customer details...</p>
            </div>
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