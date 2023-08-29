const express = require("express");
const router = express.Router();
const { auth, authRole } = require("../../middlewares/auth");

const { getAllWarranty, getWarranty, updateWarranty } = require("../warranty");

router.get("/warranty", auth, authRole('sale-person'), getAllWarranty);
router.route("/warranty/:id")
  .get(auth, authRole("sale-person"), getWarranty)
  .put(auth, authRole('sale-person'), updateWarranty);

module.exports = router;
