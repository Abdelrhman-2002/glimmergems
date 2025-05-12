import { useState, useEffect } from 'react';
import { Container, Row, Col, Carousel, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/api';
import ProductList from './Prodlist';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem, faShippingFast, faUndoAlt } from '@fortawesome/free-solid-svg-icons';
import './Home.css'; 

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredCategory, setFeaturedCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.categories) {
          setCategories(response.categories);
          // Set the first category as the featured one for the carousel
          if (response.categories.length > 0) {
            setFeaturedCategory(response.categories[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      {/* Hero Carousel - Full width */}
      <div className="w-100">
        <Carousel className="mb-5">
          <Carousel.Item>
            {/* Using image from public folder - no import needed */}
            <img
              className="d-block w-100"
              src="/images/home.jpg"
              alt="Luxury Jewelry Collection"
              style={{ height: '500px', objectFit: 'cover' }}
              onError={(e) => {
                console.log("Image 1 failed to load");
                e.target.src = "https://uploads.nationaljeweler.com/uploads/00ac339a3eab9098cb027bee721ee199.jpg";
              }}
            />
            <Carousel.Caption>
              <h1>Luxury Jewelry Collection</h1>
              <p>Discover our exquisite selection of fine jewelry</p>
              <Link to="/products">
                <Button variant="primary" size="lg">Shop Now</Button>
              </Link>
            </Carousel.Caption>
          </Carousel.Item>
          
          <Carousel.Item>
            {/* Using image from public folder - no import needed */}
            <img
              className="d-block w-100"
              src="/images/home4.jpg"
              alt="Special Offers"
              style={{ height: '500px', objectFit: 'cover' }}
              onError={(e) => {
                console.log("Image 2 failed to load");
                e.target.src = "https://assets-us-01.kc-usercontent.com/9e9a95c0-1d15-00d5-e878-50f070203f13/2591b3b9-a104-485e-8e8d-612843ea1894/chanel-fine-jewellery-boutique-slider-2.jpg";
              }}
            />
            <Carousel.Caption>
              <h1>Special Offers</h1>
              <p>Get 20% off on selected diamond rings</p>
              {featuredCategory && (
                <Link to={`/products?category=${featuredCategory._id}`}>
                  <Button variant="primary" size="lg">Shop {featuredCategory.name}</Button>
                </Link>
              )}
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>

      {/* Featured Products */}
      <Container fluid className="px-4 mb-5">
        <h2 className="text-center mb-4">Featured Products</h2>
        <ProductList />
      </Container>

      {/* Categories Section */}
      {categories.length > 0 && (
        <Container fluid className="px-4 mb-5">
          <h2 className="text-center mb-4">Shop by Category</h2>
          <Row>
            {categories.map(category => (
              <Col key={category._id} md={3} className="mb-4">
                <Link to={`/products?category=${category._id}`} className="text-decoration-none">
                  <div className="category-card">
                    <img 
                      src={category.image || `https://via.placeholder.com/300x200?text=${category.name}`}
                      alt={category.name}
                      className="img-fluid rounded" 
                    />
                    <div className="category-overlay">
                      <h3 className="category-title">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* Why Choose Us */}
      <Container fluid className="px-4 mb-5">
        <h2 className="text-center mb-5">Why Choose GlimmerGems?</h2>
        <Row className="text-center">
          <Col md={4} className="mb-4">
            <div className="p-3">
              <FontAwesomeIcon icon={faGem} size="3x" className="mb-3 text-primary" />
              <h4>Premium Quality</h4>
              <p>All our jewelry pieces are crafted using high-quality materials and stones, ensuring durability and lasting beauty.</p>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="p-3">
              <FontAwesomeIcon icon={faShippingFast} size="3x" className="mb-3 text-primary" />
              <h4>Fast Shipping</h4>
              <p>We offer quick and secure shipping options to deliver your precious jewelry safely to your doorstep.</p>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="p-3">
              <FontAwesomeIcon icon={faUndoAlt} size="3x" className="mb-3 text-primary" />
              <h4>Easy Returns</h4>
              <p>Not completely satisfied? Our hassle-free 30-day return policy ensures your peace of mind.</p>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HomePage;