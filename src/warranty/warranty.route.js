const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { createWarranty, createPaypalOrder, getMyWarranties, getWarranty } = require("./warranty.controller");

router.post("/create-paypal-order", auth, createPaypalOrder);
router.post("/capture-paypal-payment", auth, createWarranty);
router.get("/my-warranties", auth, getMyWarranties);
router.get("/my-warranty/:id", auth, getWarranty);

module.exports = router;
