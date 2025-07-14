const express = require('express');
const router = express.Router();
const {
  getAllTestimonials,
  approveTestimonial,
  toggleTestimonialVisibility,
  getPublicTestimonials,
  addTestimonial
} = require("../controllers/testimonial.controller");
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// User routes
router.post('/', authenticate, addTestimonial);
router.get('/', getPublicTestimonials);

// Admin routes
router.get('/admin', authenticate, authorize('admin'), getAllTestimonials);
router.put('/admin/:testimonialId/approve', authenticate, authorize('admin'), approveTestimonial);
router.put('/admin/:testimonialId/visibility', authenticate, authorize('admin'), toggleTestimonialVisibility);

module.exports = router;

