import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, Badge, InputGroup } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import ProductList from './Prodlist';
import { getCategories } from '../services/api';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const categoryId = searchParams.get('category');
  const minPriceParam = searchParams.get('min_price');
  const maxPriceParam = searchParams.get('max_price');
  const searchParam = searchParams.get('search');
  
  // Set form values from URL parameters on component mount
  useEffect(() => {
    if (minPriceParam) setMinPrice(minPriceParam);
    if (maxPriceParam) setMaxPrice(maxPriceParam);
    if (searchParam) setSearchTerm(searchParam);
  }, [minPriceParam, maxPriceParam, searchParam]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.categories) {
          setCategories(response.categories);
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
    
    // Always preserve category filter if it exists
    if (categoryId) {
      params.set('category', categoryId);
    }
    
    // Update price filters
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
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams);
    
    // Update search parameter
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    
    // Preserve other filters
    if (categoryId) params.set('category', categoryId);
    if (minPriceParam) params.set('min_price', minPriceParam);
    if (maxPriceParam) params.set('max_price', maxPriceParam);
    
    setSearchParams(params);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    
    setSearchParams(params);
  };
  
  // Function to handle category selection while preserving price filters
  const handleCategorySelect = (categoryId = null) => {
    const params = new URLSearchParams(searchParams);
    
    // Update category filter or remove it if 'All' is selected
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    
    // Preserve other filters
    if (minPrice) {
      params.set('min_price', minPrice);
    }
    
    if (maxPrice) {
      params.set('max_price', maxPrice);
    }
    
    if (searchParam) {
      params.set('search', searchParam);
    }
    
    setSearchParams(params);
  };

  // Clear all filters
  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
    setSearchParams(categoryId ? { category: categoryId } : {});
  };

  const getCategoryName = () => {
    if (!categoryId) return 'All Jewelry';
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : 'Products';
  };

  // Check if any filters are active
  const hasActiveFilters = minPriceParam || maxPriceParam || searchParam;

  return (
    <Container className="py-4">
      <h1 className="mb-4">{getCategoryName()}</h1>
      
      {/* Search bar */}
      <Form onSubmit={handleSearchSubmit} className="mb-4">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              onClick={clearSearch}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          )}
          <Button variant="primary" type="submit">
            <FontAwesomeIcon icon={faSearch} className="me-2" />
            Search
          </Button>
        </InputGroup>
      </Form>
      
      {searchParam && (
        <div className="mb-4">
          <Badge bg="info" className="p-2">
            Search results for: "{searchParam}"
            <Button 
              variant="link" 
              className="text-white p-0 ms-2" 
              onClick={clearSearch}
              style={{ textDecoration: 'none' }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </Badge>
        </div>
      )}
      
      <Row>
        {/* Sidebar with filters */}
        <Col lg={3} className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Filters</h4>
            {hasActiveFilters && (
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={clearFilters}
              >
                Clear All
              </Button>
            )}
          </div>
          
          <Form onSubmit={handleFilterSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                Price Range 
                {(minPriceParam || maxPriceParam) && (
                  <Badge bg="primary" pill className="ms-2">
                    Active
                  </Badge>
                )}
              </Form.Label>
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
              onClick={() => handleCategorySelect()}
            >
              All Jewelry
            </ListGroup.Item>
            {categories.map(category => (
              <ListGroup.Item 
                key={category._id}
                action
                active={categoryId === category._id}
                onClick={() => handleCategorySelect(category._id)}
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