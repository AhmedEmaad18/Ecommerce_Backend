const Brand = require('../Models/brand.model'); 
const logger = require('../utils/logger.util'); 

exports.createBrand = async (req, res) => {
    try {
        const { name, description ,isactive=true} = req.body;

        if (!name || !description) {
            return res.status(400).json({
                message: 'Name and description are required.'
            });
        }

        const newBrand = new Brand({ name, description ,isactive});
        await newBrand.save();

        logger.info(`Brand created with ID ${newBrand._id}`);
        return res.status(201).json({
            message: 'Brand created successfully!',
            brand: newBrand
        });
    } catch (err) {
        logger.error(`Error creating brand: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to create brand',
            error: err.message
        });
    }
};

exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find({isactive:true});
        return res.status(200).json(brands);
    } catch (err) {
        logger.error(`Error fetching brands: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to fetch brands',
            error: err.message
        });
    }
};
exports.admingetAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        return res.status(200).json(brands);
    } catch (err) {
        logger.error(`Error fetching brands: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to fetch brands',
            error: err.message
        });
    }
};
exports.getBrandById = async (req, res) => {
    try {
        const { brandId } = req.params;
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({
                message: 'Brand not found.'
            });
        }
        return res.status(200).json(brand);
    } catch (err) {
        logger.error(`Error fetching brand: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to fetch brand',
            error: err.message
        });
    }
};
exports.updateBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { name, description, isactive } = req.body;

    // Check required fields only if updating name or description
    if ((name !== undefined && name.trim() === '') || (description !== undefined && description.trim() === '')) {
      return res.status(400).json({
        message: 'Name and description cannot be empty if provided.'
      });
    }

    // Build update object dynamically
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isactive !== undefined) updateData.isactive = isactive;

    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({
        message: 'Brand not found.'
      });
    }

    logger.info(`Brand with ID ${brandId} updated.`);
    return res.status(200).json({
      message: 'Brand updated successfully!',
      brand: updatedBrand
    });
  } catch (err) {
    logger.error(`Error updating brand: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to update brand',
      error: err.message
    });
  }
};


exports.deleteBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        const deletedBrand = await Brand.findByIdAndUpdate(
            brandId,{ isactive:false },{ new: true, runValidators: true }
        );
        if (!deletedBrand) {
            return res.status(404).json({
                message: 'Brand not found.'
            });
        }

        logger.info(`Brand with ID ${brandId} deleted.`);
        return res.status(200).json({
            message: 'Brand deleted successfully!'
        });
    } catch (err) {
        logger.error(`Error deleting brand: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to delete brand',
            error: err.message
        });
    }
};
