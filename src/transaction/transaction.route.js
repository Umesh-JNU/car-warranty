const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { createTransaction, getAllTransaction, getTransaction, updateTransaction, deleteTransaction } = require("./transaction.controller");

router.post("/", createTransaction);
router.post("/", getAllTransaction);
router.route("/:id")
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);
  
module.exports = router;
