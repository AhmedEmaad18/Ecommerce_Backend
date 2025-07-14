const express = require('express');
const router = express.Router();
const { getUsers, createUser ,getUserById ,updateUserById,deleteUserById,updateUserRole,reactivateUser} = require('../controllers/user.controller'); // Ensure correct import
const{authenticate}=require('../middleware/auth.middleware')
const{authorize}=require('../middleware/role.middleware')
router.get('/', authenticate,authorize('admin'),getUsers);
router.post('/creatadmin', authenticate,authorize('admin'),createUser('admin'));
router.get('/:id', authenticate, getUserById); 
router.post('/', createUser('user') ); 
router.put('/admin/:id', authenticate,authorize('admin'),  updateUserById);
router.patch('/admin/:id/reactive', authenticate,authorize('admin'),  reactivateUser);

router.delete('/admin/:id', authenticate, authorize('admin'), deleteUserById);
router.patch('/:id/role', authenticate, authorize('admin'), updateUserRole);

module.exports = router;
