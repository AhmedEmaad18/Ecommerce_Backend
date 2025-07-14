const Product = require('../Models/product.model.js');
const Cache=require('../utils/cache.util.js');
const logger = require('./../utils/logger.util.js');
const Category =require('./../Models/category.model.js');
const Subcategory =require('./../Models/subcategory.model.js')
const Brand =require('./../Models/brand.model.js')
const Testimonial = require('./../Models/testmonial.model.js'); // Make sure path is correct

exports.createProduct = async (req, res) => {
    try {
        Cache.del('products');
        const { name, desc, price,categoryid,brandid,subcategoryid,stock } = req.body;
        const imageUrl =req.files?.map(file => 
         file.path.replace(/\\/g, '/') ) || [];
            const category = await Category.findById(categoryid);
            const subcategory = await Subcategory.findById(subcategoryid);
            const brand = await Brand.findById(brandid);
        if(category&&subcategory&&brand){
            const myProduct = await Product.create({
            name,
            desc,
            price,
            imageURL: imageUrl,
            category: category._id,
            brand: brand._id,
            subcategory: subcategory._id,
            stock
            });
        logger.info(`product created with  id ${myProduct._id}`);
        res.status(201).json({ 
            message: 'Product created successfully!',
            product: myProduct
        });
        }
        else{
             res.status(404).json({ 
            message: 'not find ideas!'
        });
        }
        
    } catch (err) {
        logger.error(`Something went wrong ${err.message}`);
        res.status(500).json({ 
            message: 'Failed to create product',
            error: err.message 
        });
    }
};
// exports.getProducts = async (req, res) => {
//     const cacheKey = 'products';
//     const cachedData = Cache.get(cacheKey);

//     if (cachedData) {
//         // If cached data exists, return it
//         return res.status(200).json({
//             message: 'Cached products retrieved successfully',
//             data: cachedData,data:res.paginatedResult
//         });
//     } else {
//         try {
//             // Fetch products from the database
//             const products = await Product.find();

//             // Check if pagination middleware is configured (if applicable)
//             if (!res.paginatedResult) {
//                 throw new Error('Pagination middleware not properly configured');
//             }

//             // Cache the retrieved products
//             Cache.set(cacheKey, products);

//             // Return the products
//             return res.status(200).json({
//                 message: 'Products retrieved successfully',
//                 data: products ,data:res.paginatedResult
//             });
//         } catch (err) {
//             // Handle any errors that occur during the fetch
//             return res.status(500).json({
//                 message: 'Failed to fetch products',
//                 error: err.message
//             });
//         }
//     }
// };



 exports.getProducts = async (req, res) => {
    const { categoryId, subcategoryId, brandId, sort, page = 1, limit = 10 } = req.query;

    if (page < 1 || limit < 1) {
        return res.status(400).json({ message: 'Page and limit must be positive integers.' });
    }

    const cacheKey = `products:${categoryId || 'all'}:${subcategoryId || 'all'}:${brandId || 'all'}:${sort || 'default'}:${page}:${limit}`;
    const cachedData = Cache.get(cacheKey);

    if (cachedData) {
        return res.status(200).json({
            message: 'Cached products retrieved successfully',
            data: cachedData
        });
    } else {
        try {
            const filter = {  isactive: true };
            if (categoryId) filter.category = categoryId;
            if (subcategoryId) filter.subcategory = subcategoryId;
            if (brandId) filter.brand = brandId;

            let sortOptions = {};
            if (sort === 'asc') {
                sortOptions.price = 1;
            } else if (sort === 'desc') {
                sortOptions.price = -1;
            } else if (sort) {
                return res.status(400).json({ message: 'Invalid sort value.' });
            }

            const products = await Product.find(filter)
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(Number(limit));

            const totalProducts = await Product.countDocuments(filter);

            const categoryIds = [...new Set(products.map(product => product.category))];
            const brandIds = [...new Set(products.map(product => product.brand))];
            const subcategoryIds = [...new Set(products.map(product => product.subcategory))];

            const [categories, brands, subcategories] = await Promise.all([
                Category.find({ _id: { $in: categoryIds } }),
                Brand.find({ _id: { $in: brandIds } }),
                Subcategory.find({ _id: { $in: subcategoryIds } })
            ]);

            const categoryMap = Object.fromEntries(categories.map(cat => [cat._id.toString(), cat.name]));
            const brandMap = Object.fromEntries(brands.map(brand => [brand._id.toString(), brand.name]));
            const subcategoryMap = Object.fromEntries(subcategories.map(subcat => [subcat._id.toString(), subcat.name]));

            const productsWithNames = products.map(product => ({
                ...product.toObject(),
                category: categoryMap[product.category.toString()] || 'Unknown Category',
                brand: brandMap[product.brand.toString()] || 'Unknown Brand',
                subcategory: subcategoryMap[product.subcategory.toString()] || 'Unknown Subcategory'
            }));

            const paginatedResult = {
                totalProducts,
                totalPages: Math.ceil(totalProducts / limit),
                currentPage: Number(page),
                products: productsWithNames
            };

            Cache.set(cacheKey, paginatedResult);

            return res.status(200).json({
                message: 'Products retrieved successfully',
                data: paginatedResult
            });
        } catch (err) {
            console.error('Error fetching products:', err); // Log the error
            return res.status(500).json({
                message: 'Failed to fetch products',
                error: err.message
            });
        }
    }
};
exports.DeleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found.'
            });
        }
        // Set isActive to false
        product.isactive = false;
        await product.save();
        logger.info(`Product with ID ${productId} has been marked as inactive.`);
        return res.status(200).json({
            message: 'Product marked as inactive successfully.',
            product
        });
    } catch (err) {
        logger.error(`Error marking product as inactive: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to mark product as inactive',
            error: err.message
        });
    }
};
exports.searchProducts = async (req, res) => {
    const { q, categoryId } = req.query;
    const cacheKey = `search:${q || 'all'}:${categoryId || 'all'}`;
    const cachedData = Cache.get(cacheKey);

    if (cachedData) {
        return res.status(200).json({
            message: 'Cached search results retrieved successfully',
            data: cachedData
        });
    }

    try {
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Validate categoryId if provided
        let categoryFilterId = null;
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).json({ message: `Invalid categoryId: ${categoryId}` });
            }
            categoryFilterId = category._id;
            console.log(`Filtering by category: ${category.name} (ID: ${categoryFilterId})`);
        }

        // Build filter
        const filter = {
            name: { $regex: q, $options: 'i' },
            isactive: true
        };
        if (categoryFilterId) {
            filter.category = categoryFilterId;
        }

        console.log('Search query:', q);
        console.log('Filter object:', filter);

        // Query products
        const products = await Product.find(filter).limit(50);

        // Get unique category IDs from results
        const categoryIds = [...new Set(products.map(p => p.category.toString()))];

        // Fetch categories for those IDs
        const categories = await Category.find({ _id: { $in: categoryIds } });

        // Map categoryId to category name
        const categoryMap = Object.fromEntries(categories.map(cat => [cat._id.toString(), cat.name]));

        // Attach category names to products
        const productsWithNames = products.map(product => ({
            ...product.toObject(),
            category: categoryMap[product.category.toString()] || 'Unknown Category'
        }));

        const result = { products: productsWithNames };
        Cache.set(cacheKey, result);

        return res.status(200).json({
            message: 'Search results retrieved successfully',
            data: result
        });

    } catch (err) {
        logger.error(`Failed to search products: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to search products',
            error: err.message
        });
    }
};
exports.getproductBYid = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('subcategory', 'name')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // ✅ Fetch only APPROVED & VISIBLE testimonials
    const testimonials = await Testimonial.find({
      product: id,
      isApproved: true,
      isView: true
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    product.testimonials = testimonials;

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getAllProductsForAdmin = async (req, res) => {
  const { categoryId, subcategoryId, brandId, sort, page = 1, limit = 10 } = req.query;

  if (page < 1 || limit < 1) {
    return res.status(400).json({ message: 'Page and limit must be positive integers.' });
  }

  try {
    const filter = {};
    if (categoryId) filter.category = categoryId;
    if (subcategoryId) filter.subcategory = subcategoryId;
    if (brandId) filter.brand = brandId;

    let sortOptions = {};
    if (sort === 'asc') {
      sortOptions.price = 1;
    } else if (sort === 'desc') {
      sortOptions.price = -1;
    } else if (sort) {
      return res.status(400).json({ message: 'Invalid sort value.' });
    }

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(filter);

    const categoryIds = [...new Set(products.map(p => p.category))];
    const brandIds = [...new Set(products.map(p => p.brand))];
    const subcategoryIds = [...new Set(products.map(p => p.subcategory))];

    const [categories, brands, subcategories] = await Promise.all([
      Category.find({ _id: { $in: categoryIds } }),
      Brand.find({ _id: { $in: brandIds } }),
      Subcategory.find({ _id: { $in: subcategoryIds } }),
    ]);

    const categoryMap = Object.fromEntries(categories.map(cat => [cat._id.toString(), cat.name]));
    const brandMap = Object.fromEntries(brands.map(brand => [brand._id.toString(), brand.name]));
    const subcategoryMap = Object.fromEntries(subcategories.map(subcat => [subcat._id.toString(), subcat.name]));

    const productsWithNames = products.map(p => ({
      ...p.toObject(),
      category: categoryMap[p.category.toString()] || 'Unknown Category',
      brand: brandMap[p.brand.toString()] || 'Unknown Brand',
      subcategory: subcategoryMap[p.subcategory.toString()] || 'Unknown Subcategory'
    }));

    const result = {
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
      products: productsWithNames
    };

    return res.status(200).json({
      message: 'Admin products retrieved successfully',
      data: result
    });
  } catch (err) {
    logger.error(`Failed to fetch admin products: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to fetch products for admin',
      error: err.message
    });
  }
};
exports.activateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isactive = true;
    await product.save();

    logger.info(`Product with ID ${productId} has been marked as active.`);
    return res.status(200).json({
      message: 'Product activated successfully',
      product
    });
  } catch (err) {
    logger.error(`Error activating product: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to activate product',
      error: err.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name,
      desc,
      price,
      categoryid,
      brandid,
      subcategoryid,
      stock
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    product.name = name || product.name;
    product.desc = desc || product.desc;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.category = categoryid || product.category;
    product.brand = brandid || product.brand;
    product.subcategory = subcategoryid || product.subcategory;

    // Append new images if provided
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path.replace(/\\/g, '/'));
      product.imageURL = [...product.imageURL, ...newImages]; // append images
    }

    await product.save();

    return res.status(200).json({
      message: 'Product updated successfully',
      product
    });
  } catch (err) {
    console.error('Update error:', err.message);
    return res.status(500).json({
      message: 'Failed to update product',
      error: err.message
    });
  }
};
