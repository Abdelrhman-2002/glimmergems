import Product from '../models/Product.js';

// @desc    Get all products with optional filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      category,
      min_price,
      max_price,
      search
    } = req.query;
    
    // Add debugging logs
    console.log('Received search query:', search);
    console.log('Query parameters:', req.query);
    
    // Build MongoDB filter
    let filter = {};
    
    // Add category filter if provided
    if (category) {
      filter.category = category;
    }
    
    // Add price range filter
    if (min_price || max_price) {
      filter.price = {};
      
      if (min_price) {
        filter.price.$gte = Number(min_price);
      }
      
      if (max_price) {
        filter.price.$lte = Number(max_price);
      }
    }
    
    // Add search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      
      // Try to use text search first (more efficient for indexed fields)
      try {
        // If there are other filters, use AND logic with them
        if (Object.keys(filter).length > 0) {
          const textSearchFilter = {
            $and: [
              filter,
              { $text: { $search: searchTerm } }
            ]
          };
          
          // Try text search first
          console.log('Trying text search with filter:', JSON.stringify(textSearchFilter));
          const textSearchResults = await Product.find(textSearchFilter)
            .populate('category', 'name')
            .sort({ score: { $meta: 'textScore' } })
            .exec();
          
          // If we got results, return them
          if (textSearchResults.length > 0) {
            console.log(`Found ${textSearchResults.length} products using text search`);
            return res.status(200).json({
              success: true,
              count: textSearchResults.length,
              products: textSearchResults
            });
          }
        } else {
          // No other filters, just use text search
          const textOnlyFilter = { $text: { $search: searchTerm } };
          
          console.log('Trying text-only search with filter:', JSON.stringify(textOnlyFilter));
          const textOnlyResults = await Product.find(textOnlyFilter)
            .populate('category', 'name')
            .sort({ score: { $meta: 'textScore' } })
            .exec();
          
          // If we got results, return them
          if (textOnlyResults.length > 0) {
            console.log(`Found ${textOnlyResults.length} products using text-only search`);
            return res.status(200).json({
              success: true,
              count: textOnlyResults.length,
              products: textOnlyResults
            });
          }
        }
      } catch (textSearchError) {
        console.error('Text search error, falling back to regex:', textSearchError);
      }
      
      // Fallback to regex search if text search fails or returns no results
      // If there are other filters, use AND logic with them
      if (Object.keys(filter).length > 0) {
        filter = {
          $and: [
            filter,
            {
              $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
              ]
            }
          ]
        };
      } else {
        // If there are no other filters, just use OR for search
        filter = {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } }
          ]
        };
      }
    }
    
    console.log('Final MongoDB Filter:', JSON.stringify(filter));
    
    // Execute the query
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products matching the criteria`);
    
    // Return the response
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name');
    
    if (product) {
      res.status(200).json({
        success: true,
        product
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: error.message
    });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images, featured, discount } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images: images || [],
      featured: featured || false,
      discount: discount || 0
    });
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images, featured, discount } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.images = images || product.images;
      product.featured = featured !== undefined ? featured : product.featured;
      product.discount = discount !== undefined ? discount : product.discount;
      
      const updatedProduct = await product.save();
      
      res.status(200).json({
        success: true,
        product: updatedProduct
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      await product.deleteOne();
      
      res.status(200).json({
        success: true,
        message: 'Product removed'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.stock = stock;
      
      const updatedProduct = await product.save();
      
      res.status(200).json({
        success: true,
        product: {
          _id: updatedProduct._id,
          name: updatedProduct.name,
          stock: updatedProduct.stock
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product stock',
      error: error.message
    });
  }
}; 