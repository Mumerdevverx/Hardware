const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
let users = [];
let items = [];

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(user);

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ 
      message: 'User registered successfully',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ ITEMS ROUTES ============

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all items
app.get('/api/items', verifyToken, (req, res) => {
  try {
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item
app.post('/api/items', verifyToken, (req, res) => {
  try {
    const { name, category, purchasePrice, salePrice, quantity, imageUrl } = req.body;

    if (!name || !category || !purchasePrice || !salePrice || !quantity) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newItem = {
      id: Date.now().toString(),
      name,
      category,
      purchasePrice: Number(purchasePrice),
      salePrice: Number(salePrice),
      quantity: Number(quantity),
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString()
    };

    items.push(newItem);
    res.status(201).json({ 
      message: 'Item added successfully',
      item: newItem 
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item
app.put('/api/items/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, purchasePrice, salePrice, quantity, imageUrl } = req.body;

    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    items[index] = {
      ...items[index],
      name: name || items[index].name,
      category: category || items[index].category,
      purchasePrice: purchasePrice || items[index].purchasePrice,
      salePrice: salePrice || items[index].salePrice,
      quantity: quantity || items[index].quantity,
      imageUrl: imageUrl || items[index].imageUrl
    };

    res.json({ 
      message: 'Item updated successfully',
      item: items[index] 
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
app.delete('/api/items/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    items.splice(index, 1);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API Endpoints:`);
  console.log(`   POST   /api/auth/register     - Register new user`);
  console.log(`   POST   /api/auth/login        - Login user`);
  console.log(`   POST   /api/auth/forgot-password - Forgot password`);
  console.log(`   GET    /api/items             - Get all items`);
  console.log(`   POST   /api/items             - Add new item`);
  console.log(`   PUT    /api/items/:id         - Update item`);
  console.log(`   DELETE /api/items/:id         - Delete item`);
  console.log(`\n📝 Users in memory: ${users.length}`);
  console.log(`📦 Items in memory: ${items.length}`);
});