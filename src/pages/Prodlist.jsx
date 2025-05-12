import { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../pages/Prodcard';
import { getProducts } from '../services/api';

const ProductList = ({ categoryId = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  
  // Extract filters from URL
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const searchQuery = searchParams.get('search');
  
  // Log for debugging
  console.log('ProductList - Search Query:', searchQuery);
  console.log('ProductList - All Search Params:', Object.fromEntries([...searchParams]));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Log parameters being sent to API
        console.log('Fetching products with params:', {
          categoryId,
          minPrice,
          maxPrice,
          searchQuery
        });
        
        // Pass all filter parameters to the API
        const response = await getProducts(categoryId, minPrice, maxPrice, searchQuery);
        console.log('API Response:', response);
        setProducts(response.products || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, minPrice, maxPrice, searchQuery]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (products.length === 0) {
    return <Alert variant="info">No products found.</Alert>;
  }

  return (
    <Row>
      {products.map(product => (
        <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;