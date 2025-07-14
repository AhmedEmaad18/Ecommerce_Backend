const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createProduct, getProducts,DeleteProduct,searchProducts,getproductBYid,getAllProductsForAdmin,activateProduct,updateProduct} = require('../controllers/product.controller');
const { upload } = require('../middleware/upload.middleware');
const Product =require('./../Models/product.model');            
const paginate=require('../middleware/paginate.middleware');

router.post(
    '/', 
    authenticate, 
    authorize('admin'), 
    upload.array('img'), // <-- Changed to `.single()`
    createProduct
);
router.get('/adminproducts', authenticate, authorize('admin'), getAllProductsForAdmin);
router.get('/', paginate(Product), getProducts);
router.delete('/:productId',authenticate, authorize('admin'),  DeleteProduct);
router.put('/active/:productId', authenticate, authorize('admin'), activateProduct);
router.put('/update/:productId', authenticate, authorize('admin'), upload.array('img'), updateProduct);
router.get('/:id',getproductBYid);
router.get('/search', searchProducts);

module.exports = router;
