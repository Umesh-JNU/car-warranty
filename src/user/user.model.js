const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const validateEmail = (email) => {
	var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email);
};

const validatePassword = (password) => {
	var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*(){}[\]<>]).*$/;
	// var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*(\d|\W)).*$/;
	return re.test(password);
};

const userSchema = new mongoose.Schema({
	firstname: {
		type: String,
		required: [true, "Firstname is required."],
	},
	lastname: {
		type: String,
		required: [true, "Lastname is required."],
	},
	email: {
		type: String,
		required: [true, "Email is required."],
		unique: true,
		validate: [validateEmail, "Please fill a valid email address"]
	},
	password: {
		type: String,
		required: [true, "Password is required."],
		minLength: [8, "Password must have at least 8 characters."],
		select: false,
	},
	mobile_no: {
		type: String,
		required: [true, "Phone number is required."],
	},
	role: {
		type: String,
		default: "user",
		enum: ["user", "admin"],
	},
}, { timestamps: true });

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) next();

	this.password = await bcrypt.hash(this.password, 11);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTToken = function () {
	return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_TOKEN_EXPIRE,
	});
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;