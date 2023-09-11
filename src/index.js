const adminRoute = require("./admin");
const salePersonRoute = require("./salePerson");
const { userRoute } = require("./user");
const { levelRoute } = require("./levels");
const { warrantyRoute } = require("./warranty");
const { transactionRoute } = require("./transaction");
const { enquiryRoute } = require("./enquiry");
const paymentRoute = require("./payment");

module.exports = { adminRoute, salePersonRoute, userRoute, levelRoute, warrantyRoute, transactionRoute, paymentRoute, enquiryRoute }