const mongoose = require('mongoose');

const validateEmail = (email) => {
	var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email);
};

const vehicleDetailSchema = new mongoose.Schema({
	make: {
		type: String,
		required: [true, "Vehicle's make is required."],
	},
	fuel_type: {
		type: String,
		enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
		required: [true, "Fuel Type is required."],
	},
	model: {
		type: String,
		required: [true, "Vehicle's model is required."],
	},
	date_first_reg: {
		type: Date,
		required: [true, "Date of first registration is required."]
	},
	size: {
		type: Number,
		required: [true, "Engine Size is required,"],
	},
	mileage: {
		type: Number,
		required: [true, "mileage is required."],
	},
	drive_type: {
		type: String,
		enum: ['4x4', '4x2'],
		required: [true, "Drive Type is required."],
	},
	bhp: {
		type: Number,
		required: [true, "Vehicle's BHP is required."],
	},
});

const userDetailSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "Email is required."],
		validate: [validateEmail, "Invalid user's email address."]
	},
	firstname: {
		type: String,
		required: [true, 'First name is required.']
	},
	lastname: {
		type: String,
		required: [true, 'Last name is required.']
	},
	mobile_no: {
		type: String,
		required: [true, 'Mobile number is required.']
	},
});

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
});

const vehicleInfoSchema = new mongoose.Schema({
	purchase_date: {
		type: Date,
		required: [true, "Vehicle's is required."]
	},
	mot_due_date: {
		type: Date,
		required: [true, 'MOT date is required.']
	},
	last_service_date: {
		type: Date,
		required: [true, 'Last service date is required.']
	},
	service_history: {
		type: Boolean,
		default: false,
	}
});

const warrantySchema = new mongoose.Schema({
	vehicleDetails: {
		type: vehicleDetailSchema,
		required: [true, "Vehicle detail is required."]
	},
	userDetails: {
		type: userDetailSchema,
		required: [true, "User detail is required."]
	},
	address: {
		type: addressSchema,
		required: [true, "Address is required."]
	},
	start_date: {
		type: Date,
		required: [true, "Plan Start Date is required."],
	},
	vehicleInfo: {
		type: vehicleInfoSchema,
		required: [true, "Vehicle information is required."]
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "User ref is required"]
	},
	transaction: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Transaction",
		// required: [true, "Transaction is required"]
	},
	plan: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Plan",
		required: [true, "Please select a plan."]
	},
	status: {
		type: String,
		enum: ["awaited", "placed", "delivered"],
		default: "awaited"
	}
}, { timestamps: true });

const warrantyModel = mongoose.model('Warranty', warrantySchema);
module.exports = warrantyModel;