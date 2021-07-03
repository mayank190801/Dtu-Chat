const mongoose = require("mongoose");
const { Schema } = mongoose;

const answerSchema = new Schema({
	answer: {
		type: String,
		required: true,
	},
	upvote: Number,
	downvote: Number,
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	questionAnswered: { type: Schema.Types.ObjectId, ref: "Question" },
});

//so the schema is pretty much ready!!!, let's figure out how can i embed
//it in the answer section

module.exports = mongoose.model("Answer", answerSchema);
