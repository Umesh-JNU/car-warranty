const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
	make: {
		type: String,
		required: [true, "Make is required."],
	},
	model: {
		type: String,
		required: [true, "Model is required."],
	},
	fuel_type: {
		type: String,
		default: 'petrol',
		enum: ['CNG','gasoline','diesel','petrol','electric','hybrid']
	},
	engine_size: {
		type: String,
		required: [true, "Please specify the size of engine."],
	},
	mileage: {
		type: String,
		required: [true, "mileage is required."],
	},
	retail_val: {
		type: String,
		required: [true, "Retail Value is required."],
	},
}, { timestamps: true });

const vehicleModel = mongoose.model('Vehicle', vehicleSchema);

module.exports = vehicleModel;