const express = require("express");
const router = express.Router({ mergeParams: true });

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const { questionSchema, answerSchema } = require("../schemas");

const Question = require("../models/question");
const Answer = require("../models/answer");

const { isLoggedIn } = require("../middleware");

//----------------------------------------------

const validateQuestion = (req, res, next) => {
	const { error } = questionSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//----------------------------------------------

router.get(
	"/",
	catchAsync(async (req, res) => {
		//show case all your questions here
		const questions = await Question.find({});
		res.render("questions/index", { questions });
	})
);

//FORM FOR NEW QUESTION CREATION
router.get("/new", isLoggedIn, (req, res) => {
	res.render("questions/new");
});

//GETTING DATA FROM THE FORM AND MAKING A NEW QUESTION
router.post(
	"/",
	validateQuestion,
	isLoggedIn,
	catchAsync(async (req, res) => {
		const newQuestion = new Question(req.body.questions);
		await newQuestion.save();
		req.flash("success", "New Question Created");
		res.redirect("/questions");
	})
);

//LOOKING AT DETAILS OF A SINGLE QUESTION
router.get(
	"/:id",
	catchAsync(async (req, res) => {
		const question = await Question.findOne({
			_id: req.params.id,
		}).populate("answers");
		res.render("questions/show", { question });
	})
);

//FORM FOR EDITING THE SELECTED QUESTION
router.get(
	"/:id/edit",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const question = await Question.findOne({ _id: req.params.id });
		res.render("questions/edit", { question });
	})
);

//PATCH REQUEST TO UPDATE THE QUESTION
router.patch(
	"/:id",
	isLoggedIn,
	validateQuestion,
	catchAsync(async (req, res) => {
		const updatedQuestion = await Question.findByIdAndUpdate(
			req.params.id,
			req.body.questionss
		);
		req.flash("success", "Question Successfully Updated");
		res.redirect(`/questions/${req.params.id}`);
	})
);

//Request to Delete that question!!!
router.delete(
	"/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
		req.flash("success", "Question Successfully Deleted");
		res.redirect("/questions");
	})
);

module.exports = router;
