const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const mongoose = require("mongoose");
const warrantyModel = require("../warranty/warranty.model");
const transactionModel = require("../transaction/transaction.model");

exports.updateAfterPayment = catchAsyncError(async (req, res, next) => {
  console.log(req.body);
  const { event_type, resource } = req.body;
  console.log({ event_type, resource });

  switch (event_type) {
    case 'CHECKOUT.ORDER.APPROVED':
      console.log({ event_type });
      return res.status(200).json({ message: "Order Approval Acknowleged." });

    case 'PAYMENT.CAPTURE.COMPLETED':
      console.log({ event_type });
      var { order_id } = resource?.supplementary_data?.related_ids;
      // var warranty = await warrantyModel.findOneAndUpdate({ "paypalID.orderID": order_id }, { payment: true });
      const trans = await transactionModel.findOneAndUpdate({ "paypalID.orderID": order_id }, { status: "complete" });
      console.log({ trans });
      const allTransaction = await transactionModel.find({ warranty: trans.warranty });
      console.log({ allTransaction });
      if (allTransaction.length === 2) {
        await warrantyModel.findOneAndUpdate({ _id: trans.warranty }, { status: "order-placed" })
      }
      return res.status(200).json({ message: "Payment Capture Acknowleged." });

    case 'PAYMENT.CAPTURE.DECLINED':
      console.log({ event_type });
      // var warranty = await warrantyModel.findOne({ "paypalID.orderID": order_id });
      await transactionModel.findOneAndUpdate({ "paypalID.orderID": order_id }, { status: "fail" });
      return res.status(200).json({ message: "Payment Declined Acknowleged." });

    // case 'PAYMENT.CAPTURE.PENDING':
    //   return res.status(200).json({ message: "Order Approval Acknowleged." });

    case 'PAYMENT.CAPTURE.REFUNDED':
      console.log({ event_type });
      const { links } = resource;
      console.log({ resource, links });
      const linkParts = links[1].href.split("/");
      const id = linkParts[linkParts.length - 1];

      console.log({ linkParts, id });
      await transactionModel.findOneAndUpdate({ "paypalID.paymentID": id }, { status: 'refunded' });
      return res.status(200).json({ message: "Payment Refund Acknowleged." });

    default:
      return res.status(200).json({ message: "Acknowleged." });
  }
});