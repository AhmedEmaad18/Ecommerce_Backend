const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const globalErrorHandler = require('./middleware/error-handler.middleware');

// Create Express app
const app = express();

// === 🔒 Hardcoded Configuration ===
const CONNECTION_STRING = 'mongodb+srv://ahmedemadd186:Ahmed123456@ecomm.n1uwmbp.mongodb.net/ecomm?retryWrites=true&w=majority&appName=ecomm';
const PORT = 3000;
const JWT_SECRET = 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc1MDgzOTUzOSwiaWF0IjoxNzUwODM5NTM5fQ.ClMLxq3ZHcVA2HN0SenjVtufKaEVRYG87TAuAolqrnc';
const ALLOWED_ORIGINS = 'http://localhost:4200';

// Enable CORS
app.use(cors({
  credentials: true
}));

const MongoStore = require('connect-mongo');

app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: CONNECTION_STRING }),
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));


// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const connectdb = async () => {
  try {
    const connection = await mongoose.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ Connected to MongoDB: ${connection.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};
connectdb();

// Routes
app.use('/user', require('./routes/user.route'));
app.use('/auth', require('./routes/auth.route'));
app.use('/products', require('./routes/product.rout'));
app.use('/category', require('./routes/category.route'));
app.use('/subcategory', require('./routes/subcategory.route'));
app.use('/order', require('./routes/order.route'));
app.use('/cart', require('./routes/cart.route'));
app.use('/brand', require('./routes/brand.route'));
app.use('/testimonial', require('./routes/testimonial.route'));
app.use('/content', require('./routes/content.route'));
app.use('/faq', require('./routes/faq.route'));
app.use('/admin', require('./routes/admincart.routes'));

// Global error handler
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
