const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path'); 
const connectdb = require('./config/db.config');
const option = require('./middleware/cors.middleware');
const globalErrorHandler = require('./middleware/error-handler.middleware');
const cors = require('cors');

dotenv.config(); // Load environment variables from .env file
const app = express();
app.use(cors({
  origin: 'http://localhost:4200', // or your frontend origin
  credentials: true,               // allow cookies to be sent
}));// Middleware
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false, 
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));
app.use(express.json());

app.use(express.json()); // Parse JSON request bodies
app.use('/uploads', express.static(path.join(__dirname,'uploads'))); // Serve static files from uploads directory

// Connect to the database
connectdb();


// Define routes

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

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
