const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { createAddress, getAllAddress, getAddress, updateAddress, deleteAddress } = require("./address.controller");

router.post("/", createAddress);
router.post("/", getAllAddress);
router.route("/:id")
  .get(getAddress)
  .put(updateAddress)
  .delete(deleteAddress);
  
module.exports = router;
