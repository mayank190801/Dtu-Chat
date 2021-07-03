const mongoose = require("mongoose");
const { Schema } = mongoose;
const Answer = require("./answer");

const questionSchema = new Schema({
	question: String,
	description: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	answers: [
		{
			type: Schema.Types.ObjectId,
			ref: "Answer",
		},
	],
});

questionSchema.post("findOneAndDelete", async function (question) {
	if (question.answers.length) {
		const res = await Answer.deleteMany({
			_id: { $in: question.answers },
		});
		console.log(res);
	}
});

module.exports = mongoose.model("Question", questionSchema);
