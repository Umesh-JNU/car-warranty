const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const mongoose = require("mongoose");
const warrantyModel = require("../warranty/warranty.model");

exports.createPayment = catchAsyncError(async (req, res, next) => {
  const { vehicleDetails, level, address, start_date, userDetails } = req.body;
  if (!vehicleDetails) {
    return next(new ErrorHandler("Please fill the vehicle details.", 400));
  }
  if (!level) {
    return next(new ErrorHandler("Please select a warrantly level.", 400));
  }
  if (!address) {
    return next(new ErrorHandler("Please fill the address the section.", 400));
  }
  if (!start_date) {
    return next(new ErrorHandler("Please provide the warranty start date.", 400));
  }
  if (!userDetails) {
    return next(new ErrorHandler("Please provide the user details.", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vehicle = await vehicleModel.create([{ vehicleDetails }], { session });
    const warranty = await warrantyModel.create([{ userDetails, start_date, vehicle: vehicleDetails }], { session });

    // Commit the transaction if all creations were successful
    await session.commitTransaction();
    session.endSession();

    console.log('All instances created successfully.');
    res.send('Instances created successfully.');
  } catch (error) {
    // Abort the transaction and session in case of errors
    await session.abortTransaction();
    session.endSession();

    console.error('Error creating instances:', error.message);
    res.status(500).send('Error creating instances.');
  }
});

exports.updateAfterPayment = catchAsyncError(async (req, res, next) => {

  console.log(req.body);
  res.status(200).json({message: "Acknowledged."});
});