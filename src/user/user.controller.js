const fs = require('fs');
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const APIFeatures = require("../../utils/apiFeatures");
const { passwordGenerator } = require("../../utils/randGenerator");
const sendEmail = require("../../utils/sendEmail");
const userModel = require("./user.model");
const path = require('path');

// Create a new document
exports.createUser = catchAsyncError(async (req, res, next) => {
  const { userInfo } = req.body;
  if (!userInfo) {
    return next(new ErrorHandler("Please enter your details.", 400));
  }

  const password = passwordGenerator();
  const userDetails = { ...userInfo, password };
  const user = await userModel.create(userDetails);
  if (!user) {
    return next(new ErrorHandler("Something Went Wrong. Please try again.", 500));
  }

  try {
    const template = fs.readFileSync(path.join(__dirname, "userRegister.html"), "utf-8");

    // /{{(\w+)}}/g - match {{Word}} globally
    const renderedTemplate = template.replace(/{{(\w+)}}/g, (match, key) => {
      // console.log({ match, key })
      return userDetails[key] || match;
    });

    await sendEmail({
      email: user.email,
      subject: 'Successful Registration',
      message: renderedTemplate
    });

    res.status(200).json({
      user,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    await userModel.deleteOne({ _id: user._id });
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.login = catchAsyncError(async (req, res, next) => {
  console.log("user login", req.body);
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter your email and password", 400));

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Email is not registered with us. Please continue as guest.", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid password!", 401));

  sendData(user, 200, res);
});

// Get all documents
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await userModel.find();
  res.status(200).json({ users });
});

// Get a single document by ID
exports.getUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const user = await userModel.findById(id);
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  res.status(200).json({ user });
});

// Update a document by ID
exports.updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) return next(new ErrorHandler('User not found', 404));

  res.status(200).json({ user });
});

// Delete a document by ID
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let user = await userModel.findById(id);

  if (!user)
    return next(new ErrorHandler("User not found", 404));

  await user.deleteOne();

  res.status(200).json({
    message: "User Deleted successfully.",
  });
});
