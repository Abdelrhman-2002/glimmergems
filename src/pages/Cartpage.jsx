import { useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import CartItem from '../components/Cartitem';
import { CartContext } from '../contexts/Cartcontext';

const CartPage = () => {
  const { cartItems, clearCart, getCartTotal } = useContext(CartContext);
  
  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <Container className="py-5">
        <h1 className="mb-4">Your Shopping Cart</h1>
        <Alert variant="info">
          Your cart is empty. <Link to="/products" className="alert-link">Continue shopping</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Your Shopping Cart</h1>
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              {cartItems.map(item => (
                <CartItem key={item.product_id} item={item} />
              ))}
              <div className="d-flex justify-content-between mt-3">
                <Button variant="outline-danger" onClick={clearCart}>
                  Clear Cart
                </Button>
                <Link to="/products">
                  <Button variant="outline-secondary">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping === 0 && (
                <Alert variant="success" className="py-2">
                  <small>Free shipping on orders over $100!</small>
                </Alert>
              )}
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong>Total:</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <Link to="/checkout">
                <Button variant="primary" className="w-100">
                  <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                  Proceed to Checkout
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;