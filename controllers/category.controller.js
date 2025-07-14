const Category = require('../Models/category.model'); 
const Subcategory = require('../Models/subcategory.model'); 
const logger = require('../utils/logger.util');

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Name is required.'
            });
        }

        const newCategory = new Category({ name });
        await newCategory.save();

        logger.info(`Category created with ID ${newCategory._id}`);
        return res.status(201).json({
            message: 'Category created successfully!',
            category: newCategory
        });
    } catch (err) {
        logger.error(`Error creating category: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to create category',
            error: err.message
        });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }); 
    return res.status(200).json(categories);
  } catch (err) {
    logger.error(`Error fetching categories: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to fetch categories',
      error: err.message
    });
  }
};


// Get a category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                message: 'Category not found.'
            });
        }
        return res.status(200).json(category);
    } catch (err) {
        logger.error(`Error fetching category: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to fetch category',
            error: err.message
        });
    }
};
// Get all categories regardless of isActive status (for admin)
exports.admingetAllCategories = async (req, res) => {
 try {
    const categories = await Category.find(); 
    return res.status(200).json(categories);
  } catch (err) {
    logger.error(`Error fetching categories: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to fetch categories',
      error: err.message
    });
  }
};

exports.updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Name is required.'
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                message: 'Category not found.'
            });
        }

        logger.info(`Category with ID ${categoryId} updated.`);
        return res.status(200).json({
            message: 'Category updated successfully!',
            category: updatedCategory
        });
    } catch (err) {
        logger.error(`Error updating category: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to update category',
            error: err.message
        });
    }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    category.isActive = false;
    await category.save();

    await Subcategory.updateMany({ category: categoryId }, { isActive: false });

    logger.info(`Category with ID ${categoryId} marked as inactive.`);
    return res.status(200).json({
      message: 'Category marked as inactive (soft deleted) successfully!'
    });
  } catch (err) {
    logger.error(`Error soft deleting category: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to soft delete category',
      error: err.message
    });
  }
};
exports.activateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = true;
    await category.save();

    return res.status(200).json({ message: 'Category activated successfully' });
  } catch (err) {
    logger.error(`Error activating category: ${err.message}`);
    return res.status(500).json({ message: 'Failed to activate category', error: err.message });
  }
};