const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
	postcode: {
		type: String,
		required: [true, "Post code is required."],
	},
	addr_line1: {
		type: String,
		required: [true, "Address line is required."],
	},
	addr_line2: {
		type: String,
		required: [true, "Address Line is required."],
	},
	city: {
		type: String,
		required: [true, "City is required."],
	},
	country: {
		type: String,
		required: [true, "Country is required."],
	},
}, { timestamps: true });

const addressModel = mongoose.model('Address', addressSchema);

module.exports = addressModel;