const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const APIFeatures = require("../../utils/apiFeatures");
const transactionModel = require("./transaction.model");


// Create a new document
exports.createTransaction = catchAsyncError(async (req, res, next) => {
  const transaction = await transactionModel.create(req.body);
  res.status(201).json({ transaction });
});

// Get all documents
exports.getAllTransaction = catchAsyncError(async (req, res, next) => {
  const transactions = await transactionModel.find();
  res.status(200).json({ transactions });
});

// Get a single document by ID
exports.getTransaction = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const transaction = await transactionModel.findById(id);
  if (!transaction) {
    return next(new ErrorHandler("Transaction not found.", 404));
  }

  res.status(200).json({ transaction });
});

// Update a document by ID
exports.updateTransaction = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const transaction = await transactionModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!transaction) return next(new ErrorHandler('Transaction not found', 404));

  res.status(200).json({ transaction });
});

// Delete a document by ID
exports.deleteTransaction = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let transaction = await transactionModel.findById(id);

  if (!transaction)
    return next(new ErrorHandler("Transaction not found", 404));

  await transaction.deleteOne();

  res.status(200).json({
    message: "Transaction Deleted successfully.",
  });
});
