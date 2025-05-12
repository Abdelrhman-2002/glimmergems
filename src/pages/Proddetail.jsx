import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faShoppingCart, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { getProduct } from '../services/api';
import { CartContext } from '../contexts/Cartcontext';
import { AuthContext } from '../contexts/Authcontext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, errorMessage, setErrorMessage } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProduct(id);
        setProduct(response.product);
        setLoading(false);
      } catch (error) {
        setError('Failed to load product. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { returnUrl: `/product/${id}` } });
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading product details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/products" className="btn btn-outline-primary">
          Back to Products
        </Link>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="my-5">
        <Alert variant="info">Product not found</Alert>
        <Link to="/products" className="btn btn-outline-primary">
          Back to Products
        </Link>
      </Container>
    );
  }

  // Format price to show EGP currency
  const formatPrice = (price) => {
    return `${parseFloat(price).toLocaleString('en-EG')} EGP`;
  };

  return (
    <Container className="py-5">
      {addedToCart && (
        <Alert variant="success" dismissible onClose={() => setAddedToCart(false)}>
          Product added to cart! <Link to="/cart" className="alert-link">View Cart</Link>
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="warning" dismissible onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}
      
      <Row>
        <Col md={6} className="mb-4">
          <Image 
            src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/500x500?text=Jewelry'} 
            alt={product.name} 
            fluid 
            className="product-detail-img" 
          />
        </Col>
        <Col md={6}>
          <h1 className="mb-3">{product.name}</h1>
          <p className="product-price h3 text-primary mb-4">{formatPrice(product.price)}</p>
          
          <div className="mb-4">
            <p className="mb-2">Category: <span className="fw-bold">{product.category?.name || 'Jewelry'}</span></p>
          </div>
          
          <p className="mb-4">{product.description}</p>
          
          <div className="d-flex align-items-center mb-4">
            <Form.Label className="me-3 mb-0">Quantity:</Form.Label>
            <Form.Select 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              style={{ width: '5rem' }}
            >
              {[...Array(Math.min(10, product.stock)).keys()].map(x => (
                <option key={x + 1} value={x + 1}>{x + 1}</option>
              ))}
            </Form.Select>
          </div>
          
          <p className="mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
          
          {currentUser ? (
            <Button 
              variant="primary" 
              size="lg" 
              className="w-100" 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
              Add to Cart
            </Button>
          ) : (
            <Button 
              variant="primary" 
              size="lg" 
              className="w-100" 
              onClick={handleLoginRedirect}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
              Log In to Add to Cart
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;