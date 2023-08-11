const vehicleModel = require("./vehicle.model");
const { createVehicle, getAllVehicle, getVehicle, updateVehicle, deleteVehicle } = require("./vehicle.controller");
const vehicleRoute = require("./vehicle.route");

module.exports = { vehicleModel, createVehicle, getAllVehicle, getVehicle, updateVehicle, deleteVehicle, vehicleRoute };
