const Testimonial = require("../Models/testmonial.model");
const User = require('./../Models/user.model.js');
const Product = require('./../Models/product.model.js');

exports.addTestimonial = async (req, res) => {
  try {
    const { content, rating, productid } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const product = await Product.findById(productid);

    if (!user || !product) {
      return res.status(404).json({ message: 'User or Product not found' });
    }

    const testimonial = new Testimonial({
      user: userId,
      content,
      rating,
      product: productid,
      isApproved: false,
      isView: false
    });

    await testimonial.save();

    res.status(201).json({
      message: 'Testimonial submitted for admin approval',
      testimonial
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to submit testimonial',
      error: err.message
    });
  }
};


exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate('user', 'name email') // Correctly populate user
      .populate('product', 'name') // Correctly populate product
      .sort({ createdAt: -1 });

    res.status(200).json(testimonials);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch testimonials',
      error: err.message
    });
  }
};

exports.approveTestimonial = async (req, res) => {
  try {
    const { testimonialId } = req.params;

    const testimonial = await Testimonial.findById(testimonialId);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.isApproved = !testimonial.isApproved;
    await testimonial.save();

    res.status(200).json({
      message: 'Testimonial approval status updated',
      testimonial
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to update testimonial',
      error: err.message
    });
  }
};

exports.getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      isApproved: true,
      isView: true
    })
    .populate('user', 'name') // Correctly populate user
    .populate('product', 'name') // Correctly populate product
    .sort({ createdAt: -1 });

    res.status(200).json(testimonials);
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({
      message: 'Failed to fetch public testimonials',
      error: err.message
    });
  }
};

exports.toggleTestimonialVisibility = async (req, res) => {
  try {
    const { testimonialId } = req.params;

    const testimonial = await Testimonial.findById(testimonialId);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.isView = !testimonial.isView;
    await testimonial.save();

    res.status(200).json({
      message: 'Testimonial visibility updated',
      testimonial
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to update testimonial visibility',
      error: err.message
    });
  }
};
