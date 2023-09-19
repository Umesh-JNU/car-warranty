const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
const mongoose = require("mongoose");
const warrantyModel = require("../warranty/warranty.model");
const transactionModel = require("../transaction/transaction.model");

exports.updateAfterPayment = catchAsyncError(async (req, res, next) => {
  console.log(req.body);
  const { event_type, resource } = req.body;
  console.log({ event_type, resource });
  try {
    const { order_id } = resource?.supplementary_data?.related_ids;

    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        console.log({ event_type });
        // var warranty = await warrantyModel.findOneAndUpdate({ "paypalID.orderID": order_id }, { payment: true });
        const trans = await transactionModel.findOneAndUpdate({ "paypalID.orderID": order_id }, { status: "complete" });
        console.log({ trans });
        const allTransaction = await transactionModel.find({ warranty: trans.warranty });
        console.log({ allTransaction });
        if (allTransaction.length === 2) {
          await warrantyModel.findOneAndUpdate({ _id: trans.warranty }, { status: "order-placed" })
        }
        break;

      case 'PAYMENT.CAPTURE.DECLINED':
        console.log({ event_type });
        // var warranty = await warrantyModel.findOne({ "paypalID.orderID": order_id });
        await transactionModel.findOneAndUpdate({ "paypalID.orderID": order_id }, { status: "fail" });
        break;
      // case 'PAYMENT.CAPTURE.PENDING':

      //   break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        console.log({ event_type });
        const { links } = resource;
        console.log({ resource, links });
        const [id] = links.filter(({ method, rel, href }) => {
          console.log({ rel, href })
          if (rel === "up") {
            const linkParts = href.split("/");
            return linkParts[linkParts.length - 1];
          }
        });
        console.log({ id });
        await transactionModel.findOneAndUpdate({ "paypalID.paymentID": id }, { status: 'refunded' });
        break;

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