import { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import ProductCard from '../pages/Prodcard';
import { getProducts } from '../services/api';

const ProductList = ({ categoryId = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts(categoryId);
        setProducts(response.records || []);
        setLoading(false);
      } catch (error) {
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

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
        <Col key={product.product_id} xs={12} sm={6} md={4} lg={3} className="mb-4">
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;