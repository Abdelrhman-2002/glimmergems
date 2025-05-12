// src/admin/CategoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Modal, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, faTrash, faPlus, faSearch, faSave, 
  faTimes, faFolder, faExclamationTriangle, faCheck 
} from '@fortawesome/free-solid-svg-icons';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/adminApi';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Filter categories when search term changes
  useEffect(() => {
    filterCategories();
  }, [searchTerm, categories]);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getCategories();
      
      if (response && response.records) {
        setCategories(response.records);
      } else {
        setError('No categories found or error fetching categories.');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const filterCategories = () => {
    if (!searchTerm) {
      setFilteredCategories(categories);
      return;
    }
    
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredCategories(filtered);
  };
  
  const handleAddCategory = () => {
    setCurrentCategory({
      name: '',
      description: ''
    });
    setFormErrors({});
    setIsEditing(false);
    setShowModal(true);
  };
  
  const handleEditCategory = (category) => {
    setCurrentCategory({
      category_id: category.category_id,
      name: category.name,
      description: category.description || ''
    });
    setFormErrors({});
    setIsEditing(true);
    setShowModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!currentCategory.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setFormSubmitting(true);
      setError('');
      
      let response;
      
      if (isEditing) {
        response = await updateCategory(currentCategory);
      } else {
        response = await createCategory(currentCategory);
      }
      
      if (response && response.success) {
        // Close modal
        setShowModal(false);
        
        // Show success message
        setSuccessMessage(`Category ${isEditing ? 'updated' : 'created'} successfully.`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        // Refresh categories
        fetchCategories();
      } else {
        setError(response?.message || `Failed to ${isEditing ? 'update' : 'create'} category.`);
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} category. Please try again.`);
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      setDeleteLoading(true);
      setError('');
      
      const response = await deleteCategory(categoryToDelete.category_id);
      
      if (response && response.success) {
        // Close modal
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        
        // Show success message
        setSuccessMessage('Category deleted successfully.');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        // Update categories list
        setCategories(categories.filter(c => c.category_id !== categoryToDelete.category_id));
      } else {
        setError(response?.message || 'Failed to delete category.');
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Category Management</h1>
        <Button variant="primary" onClick={handleAddCategory}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Category
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          <FontAwesomeIcon icon={faCheck} className="me-2" />
          {successMessage}
        </Alert>
      )}
      
      {/* Search Bar */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
              <Button 
                variant="outline-secondary" 
                onClick={fetchCategories}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh List'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Categories Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading categories...</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(category => (
                  <tr key={category.category_id}>
                    <td>{category.category_id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faFolder} className="me-2 text-primary" />
                        {category.name}
                      </div>
                    </td>
                    <td>{category.description || 'No description'}</td>
                    <td>{formatDate(category.created)}</td>
                    <td>{category.product_count || 0}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditCategory(category)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClick(category)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <FontAwesomeIcon icon={faFolder} size="3x" className="text-muted mb-3" />
              <p className="mb-0">No categories found.</p>
              {searchTerm && (
                <p className="text-muted">
                  Try adjusting your search criteria.
                </p>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Category Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveCategory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentCategory.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentCategory.description}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={formSubmitting}>
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={formSubmitting}>
              {formSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the category <strong>{categoryToDelete?.name}</strong>?</p>
          <Alert variant="warning">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            This action cannot be undone. Products in this category will be affected.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleteLoading}>
            {deleteLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CategoryManagement;