const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
	method: {
		type: String,
		required: [true, "Payment method is required."]
	},
	source_id: {
		type: String,
		required: [true, "Source ID is required."]
	},
	plan: {
		type: String,
		enum: ['safe', 'secure', 'supreme'],
		required: [true, "Plan type is required."],
	},
	amount: {
		type: Number,
		required: [true, "Amount is required."],
	},
	status: {
		type: String,
		default: 'pending',
		enum: ['pending', 'fail', 'complete']
	},
	type: {
		type: String,
		enum: ["credit", "debit"],
		default: "credit",
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "User ID is required."]
	},
	warranty: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Warranty",
		required: [true, "Warranty ID is required."],
	},
}, { timestamps: true });


const transactionModel = mongoose.model('Transaction', transactionSchema);

module.exports = transactionModel;