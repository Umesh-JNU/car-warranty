const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const { createVehicle, getAllVehicle, getVehicle, updateVehicle, deleteVehicle } = require("./vehicle.controller");

router.post("/", createVehicle);
router.post("/", getAllVehicle);
router.route("/:id")
  .get(getVehicle)
  .put(updateVehicle)
  .delete(deleteVehicle);
  
module.exports = router;
