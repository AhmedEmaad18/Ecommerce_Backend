const Subcategory = require('../Models/subcategory.model');
const Category = require('../Models/category.model');
const logger = require('../utils/logger.util');

// Create a new subcategory
exports.createSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;

        // Validate input
        if (!name || !category) {
            return res.status(400).json({
                message: 'Name and category are required'
            });
        }

        // Verify category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        // Create subcategory
        const subcategory = new Subcategory({
            name,
            description: description || '',
            category: category  
        });

        await subcategory.save();

        logger.info(`Subcategory created with ID ${subcategory._id}`);
        return res.status(201).json({
            message: 'Subcategory created successfully',
            subcategory
        });

    } catch (err) {
        logger.error(`Error creating subcategory: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to create subcategory',
            error: err.message
        });
    }
};

// Get all subcategories with optional filters
exports.getAllSubcategories = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true'; // query params are strings
    } else {
      // Default filter to only active subcategories
      filter.isActive = true;
    }

    const subcategories = await Subcategory.find(filter).populate('category', 'name');
    return res.status(200).json(subcategories);
  } catch (err) {
    logger.error(`Error fetching subcategories: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to fetch subcategories',
      error: err.message
    });
  }
};

exports.admingetAllsubCategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find();
    return res.status(200).json(subcategories); // Return directly as an array
  } catch (err) {
    logger.error(`Error fetching subcategories: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to fetch subcategories',
      error: err.message
    });
  }
};



// Get subcategories by category
exports.getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subcategories = await Subcategory.find({ category: categoryId }).populate('category', 'name');
        
        return res.status(200).json(subcategories);
    } catch (err) {
        logger.error(`Error fetching subcategories by category: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to fetch subcategories',
            error: err.message
        });
    }
};

// Get a single subcategory
exports.getSubcategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const subcategory = await Subcategory.findById(subcategoryId).populate('category', 'name');
        
        if (!subcategory) {
            return res.status(404).json({
                message: 'Subcategory not found'
            });
        }

        return res.status(200).json(subcategory);
    } catch (err) {
        logger.error(`Error fetching subcategory: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to fetch subcategory',
            error: err.message
        });
    }
};

// Update a subcategory
exports.updateSubcategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const { name, description, category } = req.body;

        // Validate input
        if (!name && !description && !category) {
            return res.status(400).json({
                message: 'At least one field (name, description, or category) is required'
            });
        }

        // Verify category exists if being updated
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({
                    message: 'Category not found'
                });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (category) updateData.category = [category];

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            subcategoryId,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name');

        if (!updatedSubcategory) {
            return res.status(404).json({
                message: 'Subcategory not found'
            });
        }

        logger.info(`Subcategory with ID ${subcategoryId} updated`);
        return res.status(200).json({
            message: 'Subcategory updated successfully',
            subcategory: updatedSubcategory
        });

    } catch (err) {
        logger.error(`Error updating subcategory: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to update subcategory',
            error: err.message
        });
    }
};

// Delete a subcategory
// exports.deleteSubcategory = async (req, res) => {
//     try {
//         const { subcategoryId } = req.params;
//         const deletedSubcategory = await Subcategory.findByIdAndDelete(subcategoryId);
        
//         if (!deletedSubcategory) {
//             return res.status(404).json({
//                 message: 'Subcategory not found'
//             });
//         }

//         logger.info(`Subcategory with ID ${subcategoryId} deleted`);
//         return res.status(200).json({
//             message: 'Subcategory deleted successfully'
//         });
//     } catch (err) {
//         logger.error(`Error deleting subcategory: ${err.message}`);
//         return res.status(500).json({
//             message: 'Failed to delete subcategory',
//             error: err.message
//         });
//     }
// };
exports.deleteSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      subcategoryId,
      { isActive: false },
      { new: true }
    );

    if (!updatedSubcategory) {
      return res.status(404).json({
        message: 'Subcategory not found'
      });
    }

    logger.info(`Subcategory with ID ${subcategoryId} deactivated`);
    return res.status(200).json({
      message: 'Subcategory deactivated successfully'
    });
  } catch (err) {
    logger.error(`Error deactivating subcategory: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to deactivate subcategory',
      error: err.message
    });
  }
};
exports.activateSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const updated = await Subcategory.findByIdAndUpdate(
      subcategoryId,
      { isActive: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    return res.status(200).json({
      message: 'Subcategory reactivated successfully',
      subcategory: updated
    });
  } catch (err) {
    logger.error(`Error activating subcategory: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to activate subcategory',
      error: err.message
    });
  }
};
