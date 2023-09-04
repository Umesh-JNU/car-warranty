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
  return { expiry_date: d2, level: plan.level.level };
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

function maskString(inputString) {
  if (typeof inputString !== 'string' || inputString.length < 4) {
    // Input is not a valid string or too short to mask
    return inputString;
  }

  // Extract the first two characters and the last two characters
  const prefix = inputString.slice(0, 2);
  const suffix = inputString.slice(-2);

  // Calculate the number of asterisks needed
  const numAsterisks = inputString.length - 4;
  const maskedChars = '*'.repeat(numAsterisks);

  // Combine the prefix, masked characters, and suffix
  const maskedString = prefix + maskedChars + suffix;

  return maskedString;
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

  res.status(200).json({ data, orderID: data.id });
});

exports.createWarranty = catchAsyncError(async (req, res, next) => {
  console.log("createWarranty as onApprove", req.body)
  const { order, warrantyData } = req.body;

  if (!order || !warrantyData) {
    return next(new ErrorHandler("Bad Request", 400));
  }
  // capture payment
  const captureData = await capturePayment(order.orderID);
  const { payment_source } = captureData;

  if (payment_source.paypal) {
    var method = "paypal"
    var source_id = payment_source.paypal.account_id;
  } else if (payment_source.card) {
    var method = "card"
    var source_id = payment_source.card.last_digits;
  }
  // after that warranty and transaction will be created
  const { expiry_date, level } = await calcExpiryDate(warrantyData);
  console.log({ expiry_date, level })
  const warranty = await warrantyModel.create({ ...warrantyData, expiry_date, user: req.userId, paypalID: order.orderID });
  const transaction = await transactionModel.create({
    method, source_id,
    plan: level,
    amount: parseInt(captureData.purchase_units[0].payments.captures[0].amount.value),
    warranty: warranty._id,
    user: req.userId
  });
  console.log({ captureData });

  // TODO: store payment information such as the transaction ID
  res.status(200).json({ captureData });
});

const myWarranties = async (userId, query) => {
  const result = await warrantyModel.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "plans",
        localField: "plan",
        foreignField: "_id",
        as: "plan"
      }
    },
    { $unwind: "$plan" },
    {
      $lookup: {
        from: "levels",
        localField: "plan.level",
        foreignField: "_id",
        as: "plan.level"
      }
    },
    { $unwind: "$plan.level" },
    ...query
  ]);

  return result;
};

exports.getMyWarranties = catchAsyncError(async (req, res, next) => {
  console.log("User's all warranty")

  if (req.query.active) {
    const today = new Date();

    var [result] = await myWarranties(req.userId, [
      {
        $project: {
          _id: 1,
          start_date: 1,
          expiry_date: 1,
          plan: "$plan.level.level",
          status: 1,
          remaining_days: {
            $dateDiff: {
              startDate: today,
              endDate: "$expiry_date",
              unit: "day"
            }
          },
          createdAt: 1,
          updatedAt: 1,
        }
      },
      {
        $group: {
          _id: null,
          warranties: { $push: "$$ROOT" },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lte: ['$start_date', today] },
                    { $gte: ['$expiry_date', today] }
                  ]
                },
                1,
                0
              ]
            }
          },
          upcoming: {
            $sum: {
              $cond: [
                { $gt: ['$start_date', today] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          warranties: 1,
          active: 1,
          upcoming: 1
        }
      }
    ]);
  } else {
    var result = {
      warranties: await myWarranties(req.userId, [
        {
          $lookup: {
            from: "transactions",
            localField: "_id",
            foreignField: "warranty",
            as: "transaction"
          }
        },
        { $unwind: "$transaction" },
        {
          $project: {
            _id: 1,
            start_date: 1,
            expiry_date: 1,
            plan: "$plan.level.level",
            amount: "$transaction.amount",
            status: 1,
            createdAt: 1,
            updatedAt: 1,
          }
        }
      ])
    }
  }
  res.status(200).json(result)
});

// Get all documents
exports.getAllWarranty = catchAsyncError(async (req, res, next) => {
  console.log("get all warranties", req.query);
  // for user
  if (req.user?.role === 'admin') {
    var apiFeature = new APIFeatures(
      warrantyModel.find().sort({ createdAt: -1 }).populate([
        { path: "plan", populate: { path: "level" } },
        { path: "user" },
        { path: "salePerson", select: "firstname lastname" }
      ]), req.query).search("plan");
  }
  else if (req.user?.role === 'sale-person') {
    var apiFeature = new APIFeatures(
      warrantyModel.find({ salePerson: req.userId }).sort({ createdAt: -1 }).populate([
        { path: "plan", populate: { path: "level" } },
        { path: "user" },
      ]), req.query).search("plan");
  }
  else {
    return next(new ErrorHandler("Bad Request", 400));
  }

  let warranties = await apiFeature.query;
  let warrantyCount = warranties.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    console.log("warrantyCount", warrantyCount);
  }

  warranties = await apiFeature.query.clone();
  console.log("warranties", warranties);
  res.status(200).json({ warranties, warrantyCount });
});

// Get a single document by ID
exports.getWarranty = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!req.user) {
    var warranty = await warrantyModel.findOne({ _id: id, user: req.userId }).populate([
      { path: "user", select: "firstname lastname email mobile_no" },
      { path: "plan", select: "level", populate: { path: "level", select: "level" } }
    ]);
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
  const option = {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  };

  console.log("update warranty", req.body)
  const { id } = req.params;
  if (req.user.role === 'sale-person') {
    var warranty = await warrantyModel.findOneAndUpdate({ _id: id, salePerson: req.user._id }, req.body, option)
  } else {
    var warranty = await warrantyModel.findByIdAndUpdate(id, req.body, option);
  }
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
