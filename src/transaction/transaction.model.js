const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
	warranty: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Warranty",
		required: [true, "Warranty ID is required."],
	},
}, { timestamps: true });


const transactionModel = mongoose.model('Transaction', transactionSchema);

module.exports = transactionModel;