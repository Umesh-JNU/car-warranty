const adminRoute = require("./admin");
const { userRoute } = require("./user");
const { levelRoute } = require("./levels");
const { warrantyRoute } = require("./warranty");
const { transactionRoute } = require("./transaction");
const paymentRoute = require("./payment");

module.exports = { adminRoute, userRoute, levelRoute, warrantyRoute, transactionRoute, paymentRoute }