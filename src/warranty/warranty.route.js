const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { createWarranty, createPaypalOrder, getMyWarranties, getAllWarranty, getWarranty, updateWarranty, deleteWarranty } = require("./warranty.controller");

// router.post("/", auth, createWarranty);
router.post("/create-paypal-order", createPaypalOrder);
router.post("/capture-paypal-payment", auth, createWarranty);
router.get("/my-warranties", auth, getMyWarranties);
router.get("/my-warranty/:id", auth, getWarranty);

router.route("/:id")
  .get(getWarranty)
  .put(updateWarranty)
  .delete(deleteWarranty);

module.exports = router;
