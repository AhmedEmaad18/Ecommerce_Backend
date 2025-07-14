const mongoose = require("mongoose");

module.exports = (model) => async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sort || 'createdAt';
    const order = req.query.order === 'desc' ? -1 : 1;

    try {
        const [result, total] = await Promise.all([
            model.find().sort({ [sortBy]: order }).skip(skip).limit(limit), // Use the passed model
            model.countDocuments() // Use the passed model
        ]);

        res.paginatedResult = {
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalResult: total,
            result
        };
        next();
    } catch (err) {
        next(err);
    }
};
