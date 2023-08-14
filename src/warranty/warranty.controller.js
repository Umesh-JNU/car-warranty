const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const APIFeatures = require("../../utils/apiFeatures");
const warrantyModel = require("./warranty.model");
const { isValidObjectId } = require("mongoose");


// Create a new document
exports.createWarranty = catchAsyncError(async (req, res, next) => {
  console.log("warranty create", req.body);
  const warranty = await warrantyModel.create({ ...req.body, user: req.userId });
  res.status(201).json({ warranty });
});

// user's all warranties
exports.getMyWarranties = catchAsyncError(async (req, res, next) => {
  const userId = req.userId;
  const warranties = await warrantyModel.find({ user: userId }).select("-user");
  res.status(200).json({ warranties });
});

// Get all documents
exports.getAllWarranty = catchAsyncError(async (req, res, next) => {
  const warrantys = await warrantyModel.find();
  res.status(200).json({ warrantys });
});

// Get a single document by ID
exports.getWarranty = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!req.user) {
    var warranty = await warrantyModel.findOne({ _id: id, user: req.userId }).select("-user");
  } else {
    var warranty = await warrantyModel.findById(id);
  }

  if (!warranty) {
    return next(new ErrorHandler("Warranty not found.", 404));
  }

  res.status(200).json({ warranty });
});

// Update a document by ID
exports.updateWarranty = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const warranty = await warrantyModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!warranty) return next(new ErrorHandler('Warranty not found', 404));

  res.status(200).json({ warranty });
});

// Delete a document by ID
exports.deleteWarranty = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let warranty = await warrantyModel.findById(id);

  if (!warranty)
    return next(new ErrorHandler("Warranty not found", 404));

  await warranty.deleteOne();

  res.status(200).json({
    message: "Warranty Deleted successfully.",
  });
});
