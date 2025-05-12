import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: 0,
    default: 0
  },
  images: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Calculate discounted price
productSchema.virtual('discountedPrice').get(function() {
  return this.price * (1 - this.discount / 100);
});

// Add indexes for better query performance
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ category: 1, price: 1 }); // Compound index for category + price queries

// Add text index for better search functionality
productSchema.index(
  { name: 'text', description: 'text' },
  { 
    weights: { name: 10, description: 5 },
    name: 'product_text_index'
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product; 