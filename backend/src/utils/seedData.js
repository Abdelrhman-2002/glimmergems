import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearCollections = async () => {
  try {
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    console.log('All collections cleared');
  } catch (error) {
    console.error('Error clearing collections:', error);
    process.exit(1);
  }
};

// Mock data
const seedCategories = async () => {
  const categories = [
    {
      name: 'Rings',
      description: 'Beautiful rings for all occasions',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop'
    },
    {
      name: 'Necklaces',
      description: 'Elegant necklaces that make a statement',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop'
    },
    {
      name: 'Bracelets',
      description: 'Stylish bracelets to complement any outfit',
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&auto=format&fit=crop'
    },
    {
      name: 'Earrings',
      description: 'Stunning earrings for everyday wear or special occasions',
      image: 'https://images.unsplash.com/photo-1630019852942-7a3592132e93?w=800&auto=format&fit=crop'
    },
    {
      name: 'Watches',
      description: 'Precision timepieces that combine style and function',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop'
    }
  ];

  try {
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created`);
    return createdCategories;
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

const seedProducts = async (categories) => {
  // Get category IDs
  const categoryMap = categories.reduce((map, category) => {
    map[category.name] = category._id;
    return map;
  }, {});

  const products = [
    // Rings
    {
      name: 'Diamond Engagement Ring',
      description: 'A stunning 1-carat diamond ring set in 14k white gold, perfect for that special moment.',
      price: 2999.99,
      category: categoryMap['Rings'],
      stock: 10,
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1602752250015-5ba3147662b0?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 0
    },
    {
      name: 'Gold Wedding Band',
      description: 'Classic 18k gold wedding band, 4mm wide. Simple, elegant, and timeless.',
      price: 799.99,
      category: categoryMap['Rings'],
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1586104430865-ced6b70b52a6?w=800&auto=format&fit=crop'
      ],
      featured: false,
      discount: 5
    },
    {
      name: 'Sapphire Statement Ring',
      description: 'Bold and beautiful sapphire ring surrounded by small diamonds in a white gold setting.',
      price: 1299.99,
      category: categoryMap['Rings'],
      stock: 8,
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 10
    },
    // Necklaces
    {
      name: 'Pearl Pendant Necklace',
      description: 'Elegant freshwater pearl pendant on a sterling silver chain. A classic piece for any occasion.',
      price: 129.99,
      category: categoryMap['Necklaces'],
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 0
    },
    {
      name: 'Diamond Heart Necklace',
      description: 'A beautiful heart-shaped pendant with pavé diamonds in 14k rose gold.',
      price: 899.99,
      category: categoryMap['Necklaces'],
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1601821132925-c708d9561589?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 5
    },
    {
      name: 'Gold Chain',
      description: '24-inch 14k gold chain with lobster clasp closure. Perfect for everyday wear.',
      price: 499.99,
      category: categoryMap['Necklaces'],
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&auto=format&fit=crop'
      ],
      featured: false,
      discount: 0
    },
    // Bracelets
    {
      name: 'Tennis Bracelet',
      description: 'Classic diamond tennis bracelet in 14k white gold. Features 3 carats of round brilliant diamonds.',
      price: 3499.99,
      category: categoryMap['Bracelets'],
      stock: 5,
      images: [
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 0
    },
    {
      name: 'Leather Cord Bracelet',
      description: 'Handcrafted leather cord bracelet with sterling silver accents. Adjustable size.',
      price: 49.99,
      category: categoryMap['Bracelets'],
      stock: 50,
      images: [
        'https://images.unsplash.com/photo-1607703829739-c05b7beddf60?w=800&auto=format&fit=crop'
      ],
      featured: false,
      discount: 15
    },
    {
      name: 'Charm Bracelet',
      description: 'Sterling silver charm bracelet with 5 pre-attached charms. Add your own to make it unique!',
      price: 199.99,
      category: categoryMap['Bracelets'],
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1596944924616-7b38e4b21b6c?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 0
    },
    // Earrings
    {
      name: 'Diamond Stud Earrings',
      description: 'Classic 1-carat total weight diamond studs in 14k white gold. A must-have for every jewelry collection.',
      price: 1499.99,
      category: categoryMap['Earrings'],
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1630019852942-7a3592132e93?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 0
    },
    {
      name: 'Hoop Earrings',
      description: '2-inch sterling silver hoop earrings. Lightweight and comfortable for all-day wear.',
      price: 79.99,
      category: categoryMap['Earrings'],
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1642024571545-73af3987edea?w=800&auto=format&fit=crop'
      ],
      featured: false,
      discount: 10
    },
    {
      name: 'Pearl Drop Earrings',
      description: 'Elegant freshwater pearl drop earrings with sterling silver posts. Perfect for weddings and special occasions.',
      price: 149.99,
      category: categoryMap['Earrings'],
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1593795899822-c2ddb3cc6078?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 5
    },
    // Watches
    {
      name: 'Classic Automatic Watch',
      description: 'Sophisticated automatic movement watch with leather strap. Sapphire crystal and exhibition caseback.',
      price: 1299.99,
      category: categoryMap['Watches'],
      stock: 15,
      images: [
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 0
    },
    {
      name: 'Ladies Diamond Watch',
      description: 'Elegant women\'s watch with diamond-set bezel and mother of pearl dial. Stainless steel bracelet.',
      price: 899.99,
      category: categoryMap['Watches'],
      stock: 10,
      images: [
        'https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?w=800&auto=format&fit=crop'
      ],
      featured: true,
      discount: 5
    },
    {
      name: 'Sport Chronograph Watch',
      description: 'Multifunctional chronograph watch with silicone strap. Water-resistant to 100m.',
      price: 499.99,
      category: categoryMap['Watches'],
      stock: 20,
      images: [
        'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&auto=format&fit=crop'
      ],
      featured: false,
      discount: 10
    }
  ];

  try {
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products created`);
    return createdProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  // Create hashed password
  const password = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const users = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      phone: '555-123-4567',
      role: 'customer'
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password,
      address: {
        street: '456 Park Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      phone: '555-987-6543',
      role: 'customer'
    },
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      address: {
        street: '789 Admin St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60001',
        country: 'USA'
      },
      phone: '555-111-2222',
      role: 'admin'
    }
  ];

  try {
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

const seedOrders = async (users, products) => {
  // Get user IDs
  const customer1 = users.find(user => user.email === 'john@example.com');
  const customer2 = users.find(user => user.email === 'jane@example.com');

  // Sample order items
  const orderItems1 = [
    {
      product: products[0]._id,
      quantity: 1,
      price: products[0].price
    },
    {
      product: products[3]._id,
      quantity: 1,
      price: products[3].price
    }
  ];

  const orderItems2 = [
    {
      product: products[6]._id,
      quantity: 1,
      price: products[6].price
    }
  ];

  const orderItems3 = [
    {
      product: products[9]._id,
      quantity: 2,
      price: products[9].price
    },
    {
      product: products[12]._id,
      quantity: 1,
      price: products[12].price
    },
    {
      product: products[4]._id,
      quantity: 1,
      price: products[4].price
    }
  ];

  // Calculate subtotals
  const subtotal1 = orderItems1.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotal2 = orderItems2.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotal3 = orderItems3.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate tax and shipping
  const tax1 = subtotal1 * 0.07;
  const tax2 = subtotal2 * 0.07;
  const tax3 = subtotal3 * 0.07;

  const shipping1 = 10.99;
  const shipping2 = 10.99;
  const shipping3 = 15.99;

  // Calculate total
  const total1 = subtotal1 + tax1 + shipping1;
  const total2 = subtotal2 + tax2 + shipping2;
  const total3 = subtotal3 + tax3 + shipping3;

  const orders = [
    {
      user: customer1._id,
      items: orderItems1,
      shippingAddress: {
        firstName: customer1.firstName,
        lastName: customer1.lastName,
        street: customer1.address.street,
        city: customer1.address.city,
        state: customer1.address.state,
        zipCode: customer1.address.zipCode,
        country: customer1.address.country,
        phone: customer1.phone
      },
      paymentInfo: {
        method: 'credit_card',
        transactionId: 'txn_123456789',
        status: 'completed'
      },
      status: 'delivered',
      subtotal: subtotal1,
      tax: tax1,
      shipping: shipping1,
      total: total1,
      notes: 'Please gift wrap items'
    },
    {
      user: customer1._id,
      items: orderItems2,
      shippingAddress: {
        firstName: customer1.firstName,
        lastName: customer1.lastName,
        street: customer1.address.street,
        city: customer1.address.city,
        state: customer1.address.state,
        zipCode: customer1.address.zipCode,
        country: customer1.address.country,
        phone: customer1.phone
      },
      paymentInfo: {
        method: 'stripe',
        transactionId: 'txn_987654321',
        status: 'completed'
      },
      status: 'shipped',
      subtotal: subtotal2,
      tax: tax2,
      shipping: shipping2,
      total: total2
    },
    {
      user: customer2._id,
      items: orderItems3,
      shippingAddress: {
        firstName: customer2.firstName,
        lastName: customer2.lastName,
        street: customer2.address.street,
        city: customer2.address.city,
        state: customer2.address.state,
        zipCode: customer2.address.zipCode,
        country: customer2.address.country,
        phone: customer2.phone
      },
      paymentInfo: {
        method: 'credit_card',
        transactionId: 'txn_456789123',
        status: 'completed'
      },
      status: 'processing',
      subtotal: subtotal3,
      tax: tax3,
      shipping: shipping3,
      total: total3,
      notes: 'Call before delivery'
    }
  ];

  try {
    const createdOrders = await Order.insertMany(orders);
    console.log(`${createdOrders.length} orders created`);
    return createdOrders;
  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await clearCollections();

    // Seed data
    const categories = await seedCategories();
    const products = await seedProducts(categories);
    const users = await seedUsers();
    await seedOrders(users, products);

    console.log('Database seeded successfully!');
    console.log('\nYou can now use the following credentials to log in:');
    console.log('Customer: john@example.com / password123');
    console.log('Admin: admin@example.com / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 