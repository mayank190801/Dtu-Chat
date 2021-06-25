const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema({
	question: String,
	description: String,
	author: String,
});

module.exports = mongoose.model("Question", questionSchema);
