const addressModel = require("./address.model");
const { createAddress, getAllAddress, getAddress, updateAddress, deleteAddress } = require("./address.controller");
const addressRoute = require("./address.route");

module.exports = { addressModel, createAddress, getAllAddress, getAddress, updateAddress, deleteAddress, addressRoute };
