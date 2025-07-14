const User = require('../Models/user.model');
const catchAsync = require('../utils/catch-async.util');
const AppError = require('./../utils/app-error.util');

exports.createUser  = (role) => {
    return catchAsync(async (req, res, next) => {
        const { name, email, password, phone, address, gender } = req.body;

        // Validate role before creating the user
        if (!['admin', 'user'].includes(role)) {
            return next(new AppError('Invalid role in creating user', 400));
        }

        // Check if the email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return next(new AppError('Email already exists', 400));
        }

        // Create the new user only after validating the role and checking for existing email
        const newUser  = await User.create({ name, email, password, role, phone, address, gender });

        res.status(201).json({ message: 'User  created', newUser  });
    });
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ message: 'Users retrieved', users });
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve users', error: err.message });
    }
};
// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find({ isActive: true }); // Only active users
//     res.status(200).json({ message: 'Users retrieved', users });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to retrieve users', error: err.message });
//   }
// };
exports.reactivateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: true },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    message: 'User reactivated successfully',
    user
  });
});


exports.getUserById = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({ message: 'User retrieved', user });
});
exports.updateUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { name, email, phone, address, gender } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, email, phone, address, gender },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    message: 'User updated successfully',
    user: updatedUser
  });
});
exports.deleteUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    message: 'User deactivated (soft-deleted) successfully',
    user
  });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { role } = req.body;

  // Validate role
  if (!['admin', 'user'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  // Update the user's role
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    message: 'User role updated successfully',
    user,
  });
});


