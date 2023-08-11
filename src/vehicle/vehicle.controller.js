const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const APIFeatures = require("../../utils/apiFeatures");
const vehicleModel = require("./vehicle.model");


// Create a new document
exports.createVehicle = catchAsyncError(async (req, res, next) => {
  const vehicle = await vehicleModel.create(req.body);
  res.status(201).json({ vehicle });
});

// Get all documents
exports.getAllVehicle = catchAsyncError(async (req, res, next) => {
  const vehicles = await vehicleModel.find();
  res.status(200).json({ vehicles });
});

// Get a single document by ID
exports.getVehicle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const vehicle = await vehicleModel.findById(id);
  if (!vehicle) {
    return next(new ErrorHandler("Vehicle not found.", 404));
  }

  res.status(200).json({ vehicle });
});

// Update a document by ID
exports.updateVehicle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const vehicle = await vehicleModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!vehicle) return next(new ErrorHandler('Vehicle not found', 404));

  res.status(200).json({ vehicle });
});

// Delete a document by ID
exports.deleteVehicle = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let vehicle = await vehicleModel.findById(id);

  if (!vehicle)
    return next(new ErrorHandler("Vehicle not found", 404));

  await vehicle.deleteOne();

  res.status(200).json({
    message: "Vehicle Deleted successfully.",
  });
});
