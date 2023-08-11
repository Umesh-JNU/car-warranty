const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const APIFeatures = require("../../utils/apiFeatures");
const addressModel = require("./address.model");


// Create a new document
exports.createAddress = catchAsyncError(async (req, res, next) => {
  const address = await addressModel.create(req.body);
  res.status(201).json({ address });
});

// Get all documents
exports.getAllAddress = catchAsyncError(async (req, res, next) => {
  const addresss = await addressModel.find();
  res.status(200).json({ addresss });
});

// Get a single document by ID
exports.getAddress = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const address = await addressModel.findById(id);
  if (!address) {
    return next(new ErrorHandler("Address not found.", 404));
  }

  res.status(200).json({ address });
});

// Update a document by ID
exports.updateAddress = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const address = await addressModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!address) return next(new ErrorHandler('Address not found', 404));

  res.status(200).json({ address });
});

// Delete a document by ID
exports.deleteAddress = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let address = await addressModel.findById(id);

  if (!address)
    return next(new ErrorHandler("Address not found", 404));

  await address.deleteOne();

  res.status(200).json({
    message: "Address Deleted successfully.",
  });
});
