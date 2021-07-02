const express = require("express");
const router = express.Router({ mergeParams: true });

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const { questionSchema, answerSchema } = require("../schemas");

const Question = require("../models/question");
const Answer = require("../models/answer");

const { isLoggedIn } = require("../middleware");

//----------------------------------------------

const validatedAnswer = (req, res, next) => {
	const { error } = answerSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//----------------------------------------------

router.post(
	"/",
	validatedAnswer,
	catchAsync(async (req, res) => {
		const { id } = req.params;

		const question = await Question.findById(id);
		const answer = await new Answer(req.body.answer);

		question.answers.push(answer);
		answer.questionAnswered = question;

		await question.save();
		await answer.save();

		res.redirect(`/questions/${id}`);
	})
);

//Request to delete a review!!!
router.delete(
	"/:answerId",
	isLoggedIn,
	catchAsync(async (req, res) => {
		//now this time it will simply not show delete button like this,
		//it will be much more advanced, no caps
		const { id, answerId } = req.params;
		//first of all remove from answer area
		await Question.findByIdAndUpdate(id, {
			$pull: { answers: answerId },
		});
		await Answer.findByIdAndDelete(answerId);

		res.redirect(`/questions/${id}`);
	})
);

module.exports = router;
