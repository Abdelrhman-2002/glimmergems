import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Spinner, 
  Alert,
  InputGroup,
  Badge,
  Pagination
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faPlus, 
  faSearch, 
  faSort, 
  faSave
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ProductsAdmin = () => {
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
    featured: false,
    discount: 0
  });
  
  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }
        
        // Fetch products
        const productsResponse = await axios.get('http://localhost:3001/api/products', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch categories
        const categoriesResponse = await axios.get('http://localhost:3001/api/categories', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (productsResponse.data.success) {
          setProducts(productsResponse.data.products);
        }
        
        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products or categories');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle image URLs input (comma-separated)
  const handleImagesInputChange = (e) => {
    const imagesString = e.target.value;
    // Convert comma-separated string to array
    const imagesArray = imagesString.split(',').map(url => url.trim()).filter(url => url);
    
    setFormData({
      ...formData,
      images: imagesArray
    });
  };
  
  // Open modal for creating a new product
  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories.length > 0 ? categories[0]._id : '',
      stock: '',
      images: [],
      featured: false,
      discount: 0
    });
    setIsCreating(true);
    setEditingProduct(null);
    setShowModal(true);
  };
  
  // Open modal for editing a product
  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category._id,
      stock: product.stock,
      images: product.images || [],
      featured: product.featured || false,
      discount: product.discount || 0
    });
    setIsCreating(false);
    setEditingProduct(product);
    setShowModal(true);
  };
  
  // Handle form submission for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        discount: parseInt(formData.discount)
      };
      
      let response;
      
      if (isCreating) {
        // Create new product
        response = await axios.post('http://localhost:3001/api/products', data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          // Add new product to list
          setProducts([response.data.product, ...products]);
        }
      } else {
        // Update existing product
        response = await axios.put(`http://localhost:3001/api/products/${editingProduct._id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          // Update product in list
          setProducts(products.map(p => 
            p._id === editingProduct._id ? response.data.product : p
          ));
        }
      }
      
      // Close modal
      setShowModal(false);
      setError(null);
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product');
    }
  };
  
  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const response = await axios.delete(`http://localhost:3001/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Remove product from list
        setProducts(products.filter(p => p._id !== productId));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toLocaleString('en-EG')} EGP`;
  };
  
  // Filter products by search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading products...</p>
      </div>
    );
  }
  
  if (error && products.length === 0) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Products</h1>
        <Button 
          variant="primary" 
          onClick={handleAddProduct}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Product
        </Button>
      </div>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <InputGroup style={{ maxWidth: '400px' }}>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <div className="text-muted">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </div>
          </div>
          
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(product => (
                <tr key={product._id}>
                  <td style={{ width: '80px' }}>
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/50x50?text=Jewelry'} 
                      alt={product.name} 
                      className="img-thumbnail" 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category?.name || 'Uncategorized'}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    {product.stock <= 0 ? (
                      <Badge bg="danger">Out of Stock</Badge>
                    ) : product.stock <= 5 ? (
                      <Badge bg="warning">Low Stock: {product.stock}</Badge>
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td>
                    {product.featured ? (
                      <Badge bg="success">Featured</Badge>
                    ) : (
                      <Badge bg="secondary">No</Badge>
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
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
              
              {currentProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                
                {[...Array(totalPages).keys()].map(number => (
                  <Pagination.Item 
                    key={number + 1} 
                    active={number + 1 === currentPage}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Product Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isCreating ? 'Add New Product' : 'Edit Product'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (EGP)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Image URLs (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={formData.images.join(', ')}
                onChange={handleImagesInputChange}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
              <Form.Text className="text-muted">
                Enter image URLs separated by commas.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Featured Product"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {isCreating ? 'Add Product' : 'Update Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsAdmin; 