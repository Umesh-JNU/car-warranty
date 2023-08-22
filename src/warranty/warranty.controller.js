const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const APIFeatures = require("../../utils/apiFeatures");
const warrantyModel = require("./warranty.model");
const { isValidObjectId } = require("mongoose");
const axios = require("axios");
const { createOrder, capturePayment } = require("../../utils/paypal");
const transactionModel = require("../transaction/transaction.model");
const { planModel } = require("../levels/level.model");

// Create a new document
// exports.createWarranty = catchAsyncError(async (req, res, next) => {
//   console.log("warranty create", req.body);
//   const warranty = await warrantyModel.create({ ...req.body, user: req.userId });
//   res.status(201).json({ warranty });
// });

exports.createPaypalOrder = catchAsyncError(async (req, res, next) => {
  console.log("Create Paypal Order");
  const data = await createOrder(req.body.amount);
  console.log({ data });
  // console.log(data.links[0], data.links[1], data.links[2], data.links[3]);
  if (data.status !== 'CREATED')
    return next(new ErrorHandler('Something went wrong', 500));

  res.status(200).json({ orderID: data.id });
});

exports.createWarranty = catchAsyncError(async (req, res, next) => {
  console.log("createWarranty as onApprove", req.body)
  const { order, warrantyData } = req.body;

  const captureData = await capturePayment(order.orderID);
  
  const warranty = await warrantyModel.create({ ...warrantyData, user: req.userId, paypalID: order.orderID });
  const plan = await planModel.findById(warranty.plan).populate("level");
  const transaction = await transactionModel.create({
    plan: plan.level.level,
    amount: parseInt(captureData.purchase_units[0].payments.captures[0].amount.value),
    warranty: warranty._id
  });
  console.log({ captureData });

  // TODO: store payment information such as the transaction ID
  res.status(200).json({ captureData });
});

// user's all warranties
exports.getMyWarranties = catchAsyncError(async (req, res, next) => {
  const userId = req.userId;
  const warranties = await warrantyModel.find({ user: userId }).select("-user");
  res.status(200).json({ warranties });
});

// Get all documents
exports.getAllWarranty = catchAsyncError(async (req, res, next) => {
  console.log("get all warranties", req.query);
  const apiFeature = new APIFeatures(
    warrantyModel.find().sort({ createdAt: -1 }).populate({
      path: "plan",
      populate: { path: "level" }
    }), req.query).search("plan");

  let warranties = await apiFeature.query;
  console.log("warranties", warranties);
  let filteredWarrantyCount = warranties.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    console.log("filteredWarrantyCount", filteredWarrantyCount);
    users = await apiFeature.query.clone();
  }
  console.log("warranties", warranties);
  res.status(200).json({ warranties, filteredWarrantyCount });
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
