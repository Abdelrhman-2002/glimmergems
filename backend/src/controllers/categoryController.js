import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
      error: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (category) {
      res.status(200).json({
        success: true,
        category
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving category',
      error: error.message
    });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    
    // Check if category with same name exists
    const categoryExists = await Category.findOne({ name });
    
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const category = await Category.create({
      name,
      description,
      image
    });
    
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    
    const category = await Category.findById(req.params.id);
    
    if (category) {
      // Check if new name is already taken by another category
      if (name && name !== category.name) {
        const nameExists = await Category.findOne({ name });
        
        if (nameExists) {
          return res.status(400).json({
            success: false,
            message: 'Category with this name already exists'
          });
        }
      }
      
      category.name = name || category.name;
      category.description = description || category.description;
      category.image = image || category.image;
      
      const updatedCategory = await category.save();
      
      res.status(200).json({
        success: true,
        category: updatedCategory
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (category) {
      await category.deleteOne();
      
      res.status(200).json({
        success: true,
        message: 'Category removed'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
}; 