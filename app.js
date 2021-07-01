const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Joi = require("joi");
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const { questionSchema, answerSchema } = require("./schemas");

//importing model from comment!!!
const Question = require("./models/question");
const Answer = require("./models/answer");

//--------------------------------------------------------

mongoose.connect("mongodb://localhost:27017/dtu-chat", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
	console.log("Database Connected!");
});

//--------------------------------------------------------

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

//--------------------------------------------------------

const validateQuestion = (req, res, next) => {
	const { error } = questionSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

const validatedAnswer = (req, res, next) => {
	const { error } = answerSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//--------------------------------------------------------

app.get("/", (req, res) => {
	res.render("home");
});

//SHOW ALL THE QUESTIONS
app.get(
	"/questions",
	catchAsync(async (req, res) => {
		//show case all your questions here
		const questions = await Question.find({});
		res.render("questions/index", { questions });
	})
);

//FORM FOR NEW QUESTION CREATION
app.get("/questions/new", (req, res) => {
	res.render("questions/new");
});

//GETTING DATA FROM THE FORM AND MAKING A NEW QUESTION
app.post(
	"/questions",
	validateQuestion,
	catchAsync(async (req, res) => {
		const newQuestion = new Question(req.body.questions);
		await newQuestion.save();
		res.redirect("/questions");
	})
);

//LOOKING AT DETAILS OF A SINGLE QUESTION
app.get(
	"/questions/:id",
	catchAsync(async (req, res) => {
		const question = await Question.findOne({
			_id: req.params.id,
		}).populate("answers");
		res.render("questions/show", { question });
	})
);

//FORM FOR EDITING THE SELECTED QUESTION
app.get(
	"/questions/:id/edit",
	catchAsync(async (req, res) => {
		const question = await Question.findOne({ _id: req.params.id });
		res.render("questions/edit", { question });
	})
);

//PATCH REQUEST TO UPDATE THE QUESTION
app.patch(
	"/questions/:id",
	validateQuestion,
	catchAsync(async (req, res) => {
		const updatedQuestion = await Question.findByIdAndUpdate(
			req.params.id,
			req.body.questions
		);
		res.redirect(`/questions/${req.params.id}`);
	})
);

//Request to Delete that question!!!
app.delete(
	"/questions/:id",
	catchAsync(async (req, res) => {
		const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
		res.redirect("/questions");
	})
);

//REQUESTS FOR REVEIWS
//Request to post a review!!
app.post(
	"/questions/:id/answer",
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
app.delete(
	"/questions/:id/answer/:answerId",
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

app.all("*", (req, res, next) => {
	next(new ExpressError("Page not found", 401));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Error found brother";
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log("Serving on 3000 port!!!");
});
