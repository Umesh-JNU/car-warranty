const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
	level: {
		type: String,
		required: [true, "Please specify the warranty level."],
		enum: ["safe", "secure", "supreme"]
	},
	max_age: {
		type: Number,
		required: [true, "Please specify the max age limit for the vehicle."]
	},
	max_milege: {
		type: Number,
		required: [true, "Please specify the max milege limit for the vehicle."]
	},
	max_bhp: {
		type: Number,
		required: [true, "Please specify the max value of the BHP."]
	},
	min_bhp: {
		type: Number,
		required: [true, "Please specify the min value of the BHP."]
	},
	cc_banding: {
		type: Boolean,
		required: [true, "Please specify whether the CC banding of vehicle is more than 2500."]
	},
	loading: {
		type: Number,
		default: 0
	},
	claim: {
		type: Number,
		required: [true, "Please specify the claim value."]
	},
	price: {
		type: Number,
		required: [true, "Please specify the base price."]
	}
}, {timestamps: true});

const warrantySchema = new mongoose.Schema({
	start_date: {
		type: Date,
		required: [true, "Plan Start Date is required."],
	},
	purchase_date: {
		type: Date,
		required: [true, "Purchase Date is required."],
	},
	due_date: {
		type:	Date,
		required: [true, "MOT Due Date is required."],
	},
	last_service_date: {
		type: Date,
		required: [true, "Last Service Date is required."],
	},
	service_history: {
		type: Boolean,
	},
	labour_rate: {
		type: String,
	},
}, { timestamps: true });

const warrantyModel = mongoose.model('Warranty', warrantySchema);

module.exports = warrantyModel;