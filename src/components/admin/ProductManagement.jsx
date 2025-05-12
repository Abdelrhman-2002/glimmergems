import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Modal, Alert, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSearch, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../services/adminApi';

// Format price to show EGP currency
const formatPrice = (price) => {
  return `${parseFloat(price).toLocaleString('en-EG')} EGP`;
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    image_url: '',
    material: '',
    gemstone: '',
    weight: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await getProducts();
        if (productsResponse.records) {
          setProducts(productsResponse.records);
        }
        
        // Fetch categories
        const categoriesResponse = await getCategories();
        if (categoriesResponse.records) {
          setCategories(categoriesResponse.records);
        }
        
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: value
    });
  };
  
  // Add new product
  const handleAddProduct = () => {
    setCurrentProduct({
      name: '',
      description: '',
      price: '',
      category_id: categories.length > 0 ? categories[0].category_id : '',
      stock: '10',
      image_url: '',
      material: '',
      gemstone: '',
      weight: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };
  
  // Edit product
  const handleEditProduct = (product) => {
    setCurrentProduct({
      ...product,
      price: product.price.toString(),
      stock: product.stock.toString(),
      weight: product.weight ? product.weight.toString() : ''
    });
    setIsEditing(true);
    setShowModal(true);
  };
  
  // Delete product confirmation
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await deleteProduct(productId);
        if (response.success) {
          setProducts(products.filter(product => product.product_id !== productId));
          setSuccessMessage('Product deleted successfully');
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } else {
          setError(response.message || 'Failed to delete product');
        }
      } catch (err) {
        setError('Failed to delete product. Please try again.');
        console.error('Error deleting product:', err);
      }
    }
  };
  
  // Save product (create or update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!currentProduct.name || !currentProduct.price || !currentProduct.category_id) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Create or update product
      const productData = {
        ...currentProduct,
        price: parseFloat(currentProduct.price),
        stock: parseInt(currentProduct.stock),
        weight: currentProduct.weight ? parseFloat(currentProduct.weight) : null
      };
      
      let response;
      if (isEditing) {
        response = await updateProduct(productData);
      } else {
        response = await createProduct(productData);
      }
      
      if (response.success) {
        // Refresh products list
        const productsResponse = await getProducts();
        if (productsResponse.records) {
          setProducts(productsResponse.records);
        }
        
        setShowModal(false);
        setSuccessMessage(`Product ${isEditing ? 'updated' : 'created'} successfully`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} product. Please try again.`);
      console.error('Error saving product:', err);
    }
  };
  
  // Filter products based on search query and category filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                          product.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || product.category_id === parseInt(filter);
    
    return matchesSearch && matchesFilter;
  });
  
  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h2>Loading products...</h2>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Product Management</h1>
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
      
      {/* Search and filter toolbar */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup className="mb-3 mb-md-0">
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} className="text-md-end">
              <Button variant="primary" onClick={handleAddProduct}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add New Product
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Products table */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product.product_id}>
                    <td>{product.product_id}</td>
                    <td>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{ height: '50px', width: '50px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/50?text=No%20Image';
                          }}
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/50?text=No%20Image"
                          alt="No product image"
                          style={{ height: '50px', width: '50px' }}
                        />
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{getCategoryName(product.category_id)}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      {product.stock <= 0 ? (
                        <Badge bg="danger">Out of Stock</Badge>
                      ) : product.stock < 5 ? (
                        <Badge bg="warning" text="dark">{product.stock} left</Badge>
                      ) : (
                        product.stock
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditProduct(product)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.product_id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProduct}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentProduct.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="category_id"
                    value={currentProduct.category_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (EGP) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={currentProduct.price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="stock"
                    value={currentProduct.stock}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentProduct.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                name="image_url"
                value={currentProduct.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              {currentProduct.image_url && (
                <div className="mt-2">
                  <img
                    src={currentProduct.image_url}
                    alt="Product preview"
                    style={{ maxHeight: '100px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100?text=Invalid%20URL';
                    }}
                  />
                </div>
              )}
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Material</Form.Label>
                  <Form.Control
                    type="text"
                    name="material"
                    value={currentProduct.material}
                    onChange={handleInputChange}
                    placeholder="e.g. 18k Gold, Silver"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Gemstone</Form.Label>
                  <Form.Control
                    type="text"
                    name="gemstone"
                    value={currentProduct.gemstone}
                    onChange={handleInputChange}
                    placeholder="e.g. Diamond, Ruby"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (g)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    name="weight"
                    value={currentProduct.weight}
                    onChange={handleInputChange}
                    placeholder="Weight in grams"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductManagement;