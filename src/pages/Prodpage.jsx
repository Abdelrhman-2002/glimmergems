import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import ProductList from './Prodlist';
import { getCategories } from '../services/api';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const categoryId = searchParams.get('category');
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.records) {
          setCategories(response.records);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams);
    
    if (minPrice) {
      params.set('min_price', minPrice);
    } else {
      params.delete('min_price');
    }
    
    if (maxPrice) {
      params.set('max_price', maxPrice);
    } else {
      params.delete('max_price');
    }
    
    setSearchParams(params);
  };

  const getCategoryName = () => {
    if (!categoryId) return 'All Jewelry';
    const category = categories.find(c => c.category_id === categoryId);
    return category ? category.name : 'Products';
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">{getCategoryName()}</h1>
      
      <Row>
        {/* Sidebar with filters */}
        <Col lg={3} className="mb-4">
          <h4>Filters</h4>
          <Form onSubmit={handleFilterSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Price Range</Form.Label>
              <Row>
                <Col>
                  <Form.Control 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                  />
                </Col>
                <Col>
                  <Form.Control 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                  />
                </Col>
              </Row>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-4">
              Apply Filters
            </Button>
          </Form>
          
          <h4>Categories</h4>
          <ListGroup>
            <ListGroup.Item 
              action 
              active={!categoryId}
              onClick={() => setSearchParams({})}
            >
              All Jewelry
            </ListGroup.Item>
            {categories.map(category => (
              <ListGroup.Item 
                key={category.category_id}
                action
                active={categoryId === category.category_id.toString()}
                onClick={() => setSearchParams({ category: category.category_id })}
              >
                {category.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        
        {/* Products grid */}
        <Col lg={9}>
          <ProductList categoryId={categoryId} />
        </Col>
      </Row>
    </Container>
  );
};

export default ProductsPage;