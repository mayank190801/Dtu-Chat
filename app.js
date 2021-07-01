const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Joi = require("joi");
const ExpressError = require("./utils/ExpressError");
const questionRouter = require("./routes/question");
const answerRouter = require("./routes/answer");
const session = require("express-session");
const flash = require("connect-flash");

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
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
	secret: "thisisastupidsecretforyourinfo",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use("/questions", questionRouter);
app.use("/questions/:id/answer", answerRouter);

//--------------------------------------------------------

app.get("/", (req, res) => {
	res.render("home");
});

//for catching random url
app.all("*", (req, res, next) => {
	next(new ExpressError("Page not found", 401));
});

//for catching error
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Error found brother";
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log("Serving on 3000 port!!!");
});
