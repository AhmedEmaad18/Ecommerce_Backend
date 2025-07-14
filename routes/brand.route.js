const express = require('express');
const router = express.Router();
const { createBrand, getAllBrands, getBrandById, updateBrand, deleteBrand ,admingetAllBrands} = require('../controllers/Brand.controller'); // Adjust the path as necessary
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.post('/admin',authenticate,authorize('admin'),createBrand);
router.get('/', getAllBrands);
router.get('/admin',authenticate,authorize('admin'), admingetAllBrands);

router.get('/:brandId', getBrandById);
router.put('/admin/:brandId',authenticate,authorize('admin'),updateBrand);
router.delete('/admin/:brandId',authenticate,authorize('admin'), deleteBrand);
module.exports = router;
