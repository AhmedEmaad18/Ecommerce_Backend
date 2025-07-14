const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { adminSubmitFaq,getAllFaqsForAdmin,updateFaq,deleteFaq,getFaqById} = require('../controllers/faq.controller');
const{authorize}=require('../middleware/role.middleware')
router.post('/admin', authenticate, authorize('admin'), adminSubmitFaq);
router.get('/admin', authenticate,  getAllFaqsForAdmin);
router.put('/update/:id',authenticate, authorize('admin'), updateFaq);
router.delete('/delete/:id',authenticate, authorize('admin'),  deleteFaq);
router.get('/admin/:id', authenticate, authorize('admin'), getFaqById);

module.exports = router;
