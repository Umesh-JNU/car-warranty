const transactionModel = require("./transaction.model");
const { createTransaction, getAllTransaction, getTransaction, updateTransaction, deleteTransaction } = require("./transaction.controller");
const transactionRoute = require("./transaction.route");

module.exports = { transactionModel, createTransaction, getAllTransaction, getTransaction, updateTransaction, deleteTransaction, transactionRoute };
