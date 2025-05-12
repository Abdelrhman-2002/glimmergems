import { useContext } from 'react';
import { Row, Col, Form, Button, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/Cartcontext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useContext(CartContext);

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    updateQuantity(item._id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item._id);
  };

  // Format price to show EGP currency
  const formatPrice = (price) => {
    return `${parseFloat(price).toLocaleString('en-EG')} EGP`;
  };

  return (
    <Row className="align-items-center mb-3 pb-3 border-bottom">
      <Col xs={3} md={2}>
        <Image 
          src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/80x80?text=Jewelry'} 
          alt={item.name}
          fluid 
          rounded 
          className="cart-item-img" 
        />
      </Col>
      <Col xs={9} md={4}>
        <Link to={`/product/${item._id}`} className="text-decoration-none">
          <h5 className="mb-1">{item.name}</h5>
        </Link>
        <p className="text-muted mb-0">{formatPrice(item.price)}</p>
      </Col>
      <Col xs={6} md={3} className="mt-3 mt-md-0">
        <Form.Control
          as="select"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="form-select-sm"
        >
          {[...Array(10).keys()].map(num => (
            <option key={num + 1} value={num + 1}>
              {num + 1}
            </option>
          ))}
        </Form.Control>
      </Col>
      <Col xs={4} md={2} className="text-end mt-3 mt-md-0">
        <span className="fw-bold">
          {formatPrice(parseFloat(item.price) * item.quantity)}
        </span>
      </Col>
      <Col xs={2} md={1} className="text-center mt-3 mt-md-0">
        <Button 
          variant="link" 
          className="text-danger p-0" 
          onClick={handleRemove}
          aria-label="Remove item"
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      </Col>
    </Row>
  );
};

export default CartItem;