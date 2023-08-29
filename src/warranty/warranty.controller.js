const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const APIFeatures = require("../../utils/apiFeatures");
const warrantyModel = require("./warranty.model");
const { isValidObjectId, default: mongoose } = require("mongoose");
const axios = require("axios");
const { createOrder, capturePayment } = require("../../utils/paypal");
const transactionModel = require("../transaction/transaction.model");
const { planModel } = require("../levels/level.model");

const calcExpiryDate = async ({ plan: planID, start_date }) => {
  const plan = await planModel.findById(planID).populate("level");
  const d1 = new Date(start_date);
  const d2 = new Date(start_date).setMonth(d1.getMonth() + plan.month);
  return { expiry_date, level: plan.level.level };
};

const evalLoad = (s, b, type) => {
  let base_laod = 0;
  if (b <= 300) base_laod = 50;
  else if (b <= 400) base_laod = 150;
  else base_laod = 350;

  if (s <= 2500 && type !== '4x4') {
    base_laod -= 50;
  } else if (s > 2500 && type === '4x4') {
    base_laod += 50;
  }

  return base_laod;
}

// Create a new document
// exports.create = catchAsyncError(async (req, res, next) => {
//   console.log("warranty create", req.body);
//   const expiry_date = await calcExpiryDate(req.body);
//   console.log({expiry_date})
//   const warranty = await warrantyModel.create({ ...req.body, expiry_date, user: req.userId });
//   res.status(201).json({ warranty });
// });

exports.createPaypalOrder = catchAsyncError(async (req, res, next) => {
  console.log("Create Paypal Order", req.body);

  const { eng_size, bhp, drive_type, planID } = req.body;
  if (!eng_size || bhp <= 0 || !bhp || !drive_type || !planID) {
    return next(new ErrorHandler("Bad Request", 400));
  }

  const plan = await planModel.findById(planID);
  if (!plan) {
    return next(new ErrorHandler("Plan not found.", 400))
  }

  const loadPercent = evalLoad(eng_size, bhp, drive_type);
  const ttl = plan.price + loadPercent;
  console.log({ plan, loadPercent, ttl });

  const data = await createOrder(ttl);

  if (data.status !== 'CREATED')
    return next(new ErrorHandler('Something went wrong', 500));

  res.status(200).json({ orderID: data.id });
});

exports.createWarranty = catchAsyncError(async (req, res, next) => {
  console.log("createWarranty as onApprove", req.body)
  const { order, warrantyData } = req.body;

  // capture payment
  const captureData = await capturePayment(order.orderID);

  // after that warranty and transaction will be created
  const { expiry_date, level } = await calcExpiryDate(warrantyData);
  console.log({ expiry_date })
  const warranty = await warrantyModel.create({ ...warrantyData, expiry_date, user: req.userId, paypalID: order.orderID });
  const transaction = await transactionModel.create({
    plan: level,
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
  let query = { user: userId };
  if (req.query.active) {
    const today = new Date();
    query = {
      ...query,
      start_date: { $lte: today },
      expiry_date: { $gte: today }
    }
  }
  const warranties = await warrantyModel.find(query).populate({
    path: "plan",
    populate: { path: "level" }
  }).select("-user");
  res.status(200).json({ warranties });
});

// Get all documents
exports.getAllWarranty = catchAsyncError(async (req, res, next) => {
  console.log("get all warranties", req.query);

  let query = {};
  if (req?.user?.role === 'sale-person') {
    query = { salePerson: req.userId }
  }

  const apiFeature = new APIFeatures(
    warrantyModel.find(query).sort({ createdAt: -1 }).populate({
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
    var warranty = await warrantyModel.findById(id).populate([{ path: "plan", populate: { path: "level" } }, { path: "user" }]);
  }

  if (!warranty) {
    return next(new ErrorHandler("Warranty not found.", 404));
  }

  res.status(200).json({ warranty });
});

// Update a document by ID
exports.updateWarranty = catchAsyncError(async (req, res, next) => {
  console.log("update warranty", req.body)
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
