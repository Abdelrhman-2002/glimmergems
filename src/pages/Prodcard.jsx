import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { CartContext } from '../contexts/Cartcontext';
import { AuthContext } from '../contexts/Authcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent event bubbling to parent link
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  const handleLoginRedirect = (e) => {
    e.preventDefault(); // Prevent event bubbling to parent link
    e.stopPropagation();
    navigate('/login', { state: { returnUrl: `/product/${product._id}` } });
  };
  
  // Format price to show EGP currency
  const formatPrice = (price) => {
    return `${parseFloat(price).toLocaleString('en-EG')} EGP`;
  };
  
  return (
    <Card className="product-card h-100">
      <Link to={`/product/${product._id}`}>
        <Card.Img
          variant="top" 
          src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Jewelry'}
          alt={product.name}
          className="product-img"
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Link to={`/product/${product._id}`} className="text-decoration-none">
          <Card.Title className="product-title">{product.name}</Card.Title>
        </Link>
        <Card.Text className="product-price">{formatPrice(product.price)}</Card.Text>
        <div className="mt-auto">
          {currentUser ? (
            <Button 
              variant="outline-primary"
              className="w-100"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          ) : (
            <Button 
              variant="outline-primary"
              className="w-100"
              onClick={handleLoginRedirect}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
              Login to Buy
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;