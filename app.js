if (process.env.NODE_ENV != "production") {
	require("dotenv").config();
}

// console.log(process.env.SECRET);

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
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const userRouter = require("./routes/user");

const MongoStore = require("connect-mongo");

// import MongoStore from "connect-mongo";

// const dbUrl = "mongodb://localhost:27017/dtu-chat";
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/dtu-chat";
// console.log(dbUrl);

//--------------------------------------------------------
// mongodb://localhost:27017/dtu-chat
mongoose.connect(dbUrl, {
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

const secret = process.env.SECRET || "thisisastupidsecretforyourinfo";

const store = new MongoStore({
	mongoUrl: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
	console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
	store,
};

app.use(session(sessionConfig));
app.use(flash());

//-----------------------------------------------------

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//-----------------------------------------------------

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use("/questions", questionRouter);
app.use("/questions/:id/answer", answerRouter);
app.use("/", userRouter);

//------------------------------------------------------

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

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Serving on port ${port}!!!`);
});
