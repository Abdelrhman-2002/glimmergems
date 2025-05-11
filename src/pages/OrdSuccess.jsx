import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faShoppingBag, faHome } from '@fortawesome/free-solid-svg-icons';

const OrderSuccessPage = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow">
            <Card.Body className="p-5 text-center">
              <FontAwesomeIcon 
                icon={faCheckCircle} 
                className="text-success mb-4" 
                style={{ fontSize: '5rem' }} 
              />
              
              <h1 className="mb-4">Order Successful!</h1>
              
              <p className="lead mb-4">
                Thank you for your purchase. Your order has been received and is being processed.
              </p>
              
              <p className="mb-4">
                A confirmation email has been sent to your email address.
              </p>
              
              <hr className="my-4" />
              
              <div className="d-grid gap-3">
                <Button 
                  as={Link} 
                  to="/orders" 
                  variant="outline-primary" 
                  size="lg"
                  className="d-flex align-items-center justify-content-center"
                >
                  <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                  View My Orders
                </Button>
                
                <Button 
                  as={Link} 
                  to="/" 
                  variant="primary" 
                  size="lg"
                  className="d-flex align-items-center justify-content-center"
                >
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  Continue Shopping
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccessPage;