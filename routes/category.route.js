const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory,admingetAllCategories,activateCategory     } = require('../controllers/category.controller'); // Adjust the path as necessary
router.post(
    '/', 
    authenticate, 
    authorize('admin'), 
    createCategory
);
router.get('/',getAllCategories);
router.get('/admin',authenticate,  authorize('admin'),admingetAllCategories);
router.put('/:categoryId/activate', authenticate, authorize('admin'), activateCategory);
router.get('/:categoryId',authenticate, getCategoryById);
router.put('/:categoryId', authenticate,  authorize('admin'),  updateCategory);
router.delete('/:categoryId',authenticate,  authorize('admin'),  deleteCategory);

module.exports = router;