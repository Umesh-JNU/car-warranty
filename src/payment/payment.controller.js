const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const mongoose = require("mongoose");
const warrantyModel = require("../warranty/warranty.model");
const transactionModel = require("../transaction/transaction.model");

exports.updateAfterPayment = catchAsyncError(async (req, res, next) => {
  console.log(req.body);
  const { event_type, resource } = req.body;

  try {
    const { order_id } = resource?.supplementary_data?.related_ids;

    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // var warranty = await warrantyModel.findOneAndUpdate({ paypalID: order_id }, { payment: true });
        await transactionModel.findOneAndUpdate({ paypalID: order_id }, { status: "complete" });
        break;
      case 'PAYMENT.CAPTURE.DECLINED':
        // var warranty = await warrantyModel.findOne({ paypalID: order_id });
        await transactionModel.findOneAndUpdate({ paypalID: order_id }, { status: "fail" });
        break;
      // case 'PAYMENT.CAPTURE.PENDING':

      //   break;

      default:
        break;
    }

    res.status(200).json({ message: "Payment Acknowledged." });

  } catch (err) {
    console.log({ error: err.message });

    res.status(200).json({ message: "Order Approval Acknowledged." });
  }
  // res.status(200).json({message: "Acknoledged."})
});