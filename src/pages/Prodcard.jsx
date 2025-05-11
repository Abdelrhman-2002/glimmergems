import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { CartContext } from '../contexts/Cartcontext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <Card className="product-card h-100">
      <Link to={`/product/${product.product_id}`}>
        <Card.Img 
          variant="top" 
          src={product.image_url || 'https://via.placeholder.com/300x200?text=Jewelry'} 
          alt={product.name}
          className="product-img"
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Link to={`/product/${product.product_id}`} className="text-decoration-none">
          <Card.Title className="product-title">{product.name}</Card.Title>
        </Link>
        <Card.Text className="product-price">${parseFloat(product.price).toFixed(2)}</Card.Text>
        <div className="mt-auto">
          <Button 
            variant="outline-primary" 
            className="w-100" 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;