const fs = require('fs');
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const APIFeatures = require("../../utils/apiFeatures");
const { passwordGenerator } = require("../../utils/randGenerator");
const sendEmail = require("../../utils/sendEmail");
const userModel = require("./user.model");
const path = require('path');

const userUpdate = async (id, info, res, next) => {
  console.log({ id, info });
  const user = await userModel.findByIdAndUpdate(id, info, {
    new: true,
    runValidators: true
  });

  if (!user) return next(new ErrorHandler('User not found', 404));

  res.status(200).json({ user });
}
// Create a new document
exports.createUser = catchAsyncError(async (req, res, next) => {
  const password = passwordGenerator();

  const userDetails = { ...req.body, password };
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

    const token = await user.getJWTToken();
    res.status(200).json({
      user,
      token,
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
    var message = "Email is not registered with us. Please continue as guest.";
    if (req.query.admin)
      var message = "Invalid Credentials."
    return next(new ErrorHandler(message, 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid password!", 401));

  const token = await user.getJWTToken();
  res.status(200).json({ user, token });
});

// Get a single document by ID
exports.getUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId;
  const user = await userModel.findById(id ? id : userId);
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  res.status(200).json({ user });
});

// Update a document by ID
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.userId;
  delete req.body.password;

  console.log(req.body)
  await userUpdate(userId, req.body, res, next);
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const userId = req.userId;
  const { curPassword, newPassword, confirmPassword } = req.body;
  if (!curPassword)
    return next(new ErrorHandler("Current Password is required.", 400));

  if (!newPassword || !confirmPassword)
    return next(new ErrorHandler("Password or Confirm Password is required.", 400));

  if (newPassword !== confirmPassword)
    return next(new ErrorHandler("Please confirm your password,", 400));

  const user = await userModel.findOne({ _id: userId }).select("+password");
  if (!user) return new ErrorHandler("User Not Found.", 404);

  const isPasswordMatched = await user.comparePassword(curPassword);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Current Password is invalid.", 400));

  user.password = newPassword;
  await user.save();
  res.status(200).json({ message: "Password Updated Successfully." });
});

// update new document
exports.updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  await userUpdate(id, req.body, res, next)
});


// Get all documents
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  console.log("get all users", req.query);
  let role = {};
  if (req.query.role) {
    role = { role: req.query.role };
  }

  const apiFeature = new APIFeatures(
    userModel.find(role).sort({ createdAt: -1 }),
    req.query
  ).search("firstname");

  let users = await apiFeature.query;
  console.log("users", users);
  let filteredUserCount = users.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    console.log("filteredUserCount", filteredUserCount);
    users = await apiFeature.query.clone();
  }
  console.log("users", users);
  res.status(200).json({ users, filteredUserCount });
});

// create sale person
exports.createSalePerson = catchAsyncError(async (req, res, next) => {
  console.log("create sale person", req.body);
  const salePerson = await userModel.create({ role: "sale-person", ...req.body });
  res.status(200).json({ salePerson });
})



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
