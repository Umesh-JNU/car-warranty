const userModel = require("../user/user.model");
const warrantyModel = require("../warranty/warranty.model");
const catchAsyncError = require("../../utils/catchAsyncError");
const ErrorHandler = require("../../utils/errorHandler");
const { s3Uploadv2, s3UploadMulti } = require("../../utils/s3");
const { transactionModel } = require("../transaction");

exports.postSingleImage = catchAsyncError(async (req, res, next) => {
  const file = req.file;
  if (!file) return next(new ErrorHandler("Invalid File (Image/PDF).", 401));

  const results = await s3Uploadv2(file);
  const location = results.Location && results.Location;
  return res.status(201).json({ data: { location } });
});

exports.postMultipleImages = catchAsyncError(async (req, res, next) => {
  const files = req.files;
  if (files) {
    const results = await s3UploadMulti(files);
    console.log(results);
    let location = [];
    results.filter((result) => {
      location.push(result.Location);
    });
    return res.status(201).json({ data: { location } });
  } else {
    return next(new ErrorHandler("Invalid Image", 401));
  }
});

exports.getStatistics = catchAsyncError(async (req, res, next) => {
  const { time } = req.params;
  const date = new Date();
  date.setHours(24, 0, 0, 0);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  let startDate = new Date(date.getFullYear(), 0, 1);
  var days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  var week = Math.ceil(days / 7);

  const pipeline = time === "month" ? [
    { $match: { status: "complete" } },
    {
      $project: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        amount: 1, // Replace 'amount' with your actual sales amount field
      },
    },
    { $match: { year: year, month: month } },
    {
      $group: {
        _id: {
          year: '$year',
          month: '$month',
          week: {
            $ceil: {
              $divide: ['$day', 7],
            },
          },
        },
        totalSales: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.week': 1 } },
    {
      $project: {
        _id: 0,
        // year: '$_id.year',
        // month: '$_id.month',
        week: '$_id.week',
        totalSales: 1,
      },
    }
  ] : [
    { $match: { status: "complete" } },
    {
      $project: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        amount: 1, // Replace 'amount' with your actual sales amount field
      },
    },
    { $match: { year: year } },
    {
      $group: {
        _id: {
          year: '$year',
          month: '$month',
        },
        totalSales: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        // year: '$_id.year',
        month: '$_id.month',
        // week: '$_id.week',
        totalSales: 1,
      },
    },
  ]
  const sales = await transactionModel.aggregate(pipeline);

  console.log({ sales })
  // if (time === "all") {
    const users = await userModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const rejected = await warrantyModel.aggregate([
      {
        $match: { status: "inspection-failed" }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const passed = await warrantyModel.aggregate([
      {
        $match: { status: "inspection-passed" }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    return res.send({
      users,
      rejected,
      passed,
      sales
    });
  // }
  // if (time === "daily") {
  //   const users = await userModel.aggregate([
  //     {
  //       $match: {
  //         $expr: {
  //           $gt: [
  //             "$createdAt",
  //             { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
  //           ],
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: 1 },
  //       },
  //     },
  //   ]);
  //   const rejected = await warrantyModel.aggregate([
  //     {
  //       $match: { status: "inspection-failed" }
  //     },
  //     {
  //       $match: {
  //         $expr: {
  //           $gt: [
  //             "$createdAt",
  //             { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
  //           ],
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: 1 },
  //       },
  //     },
  //   ]);
  //   const passed = await warrantyModel.aggregate([
  //     {
  //       $match: { status: "inspection-passed" }
  //     },
  //     {
  //       $match: {
  //         $expr: {
  //           $gt: [
  //             "$createdAt",
  //             { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
  //           ],
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: 1 },
  //       },
  //     },
  //   ]);

  //   return res.send({
  //     users,
  //     rejected,
  //     passed,
  //   });
  // }
  // if (time === "weekly") {
  //   const users = await userModel.aggregate([
  //     {
  //       $project: {
  //         week: { $week: "$createdAt" },
  //         year: { $year: "$createdAt" },
  //       },
  //     },
  //     {
  //       $match: {
  //         year: year,
  //         week: week,
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: 1 },
  //       },
  //     },
  //   ]);
  //   const rejected = await warrantyModel.aggregate([
  //     {
  //       $match: { status: "inspection-failed" }
  //     },
  //     {
  //       $project: {
  //         week: { $week: "$createdAt" },
  //         year: { $year: "$createdAt" },
  //       },
  //     },
  //     {
  //       $match: {
  //         year: year,
  //         week: week,
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: 1 },
  //       },
  //     },
  //   ]);
  //   const passed = await warrantyModel.aggregate([
  //     {
  //       $match: { status: "inspection-passed" }
  //     },
  //     {
  //       $project: {
  //         week: { $week: "$createdAt" },
  //         year: { $year: "$createdAt" },
  //       },
  //     },
  //     {
  //       $match: {
  //         year: year,
  //         week: week,
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: 1 },
  //       },
  //     },
  //   ]);

  //   return res.send({
  //     users,
  //     rejected,
  //     passed,
  //   });
  // }
  // if (time === "monthly") {
  //   const users = await userModel.aggregate([
  //     {
  //       $project: {
  //         month: { $month: "$createdAt" },
  //         year: { $year: "$createdAt" },
  //       },
  //     },
  //     {
  //       $match: {
  //         year: year,
  //         month: month,
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: 1 },
  //       },
  //     },
  //   ]);
  //   const rejected = await warrantyModel.aggregate([
  //     {
  //       $match: { status: "inspection-failed" }
  //     },
  //     {
  //       $project: {
  //         month: { $month: "$createdAt" },
  //         year: { $year: "$createdAt" },
  //       },
  //     },
  //     {
  //       $match: {
  //         year: year,
  //         month: month,
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: 1 },
  //       },
  //     },
  //   ]);
  //   const passed = await warrantyModel.aggregate([
  //     {
  //       $match: { status: "inspection-passed" }
  //     },
  //     {
  //       $project: {
  //         month: { $month: "$createdAt" },
  //         year: { $year: "$createdAt" },
  //       },
  //     },
  //     {
  //       $match: {
  //         year: year,
  //         month: month,
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         total: { $sum: 1 },
  //       },
  //     },
  //   ]);

  //   return res.send({
  //     users,
  //     rejected,
  //     passed,
  //   });
  // }
});
