const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { createWarranty, getAllWarranty, getWarranty, updateWarranty, deleteWarranty,getLevelSuggestions } = require("./warranty.controller");

router.post("/", createWarranty);
router.post("/", getAllWarranty);
router.route("/:id")
  .get(getWarranty)
  .put(updateWarranty)
  .delete(deleteWarranty);
  
router.post("/level-suggestions", getLevelSuggestions);

module.exports = router;
