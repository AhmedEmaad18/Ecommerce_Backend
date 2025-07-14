const express = require('express');
const router = express.Router();
const {
    createSubcategory,
    getAllSubcategories,
    getSubcategoriesByCategory,
    getSubcategory,
    updateSubcategory,
    deleteSubcategory,
    activateSubcategory,admingetAllsubCategories
} = require('../controllers/subcategory.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.post('/', createSubcategory);

router.get('/', getAllSubcategories);
router.get('/admin',authenticate,authorize('admin'), admingetAllsubCategories)

router.get('/category/:categoryId', getSubcategoriesByCategory);

router.get('/:subcategoryId', getSubcategory);

router.put('/:subcategoryId', updateSubcategory);
router.put('/:subcategoryId/activate', activateSubcategory);
router.delete('/:subcategoryId',authenticate,authorize('admin'), deleteSubcategory);

module.exports = router;
