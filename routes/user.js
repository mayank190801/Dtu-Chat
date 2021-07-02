const express = require("express");
const router = express.Router({ mergeParams: true });

const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

const User = require("../models/user");
const passport = require("passport");

//------------------------------------------------

router.get("/register", (req, res) => {
	res.render("users/register");
});

router.post(
	"/register",
	catchAsync(async (req, res, next) => {
		try {
			const { email, username, password } = req.body;
			const user = new User({ email, username });
			const registeredUser = await User.register(user, password);
			//let's fix this here!
			req.login(registeredUser, (err) => {
				if (err) return next(err);
				req.flash("success", "Welome to DTUChat");
				res.redirect("/questions");
			});
		} catch (e) {
			req.flash("error", e.message);
			res.redirect("/register");
		}
	})
);

router.get("/login", (req, res) => {
	res.render("users/login");
});

router.post(
	"/login",
	passport.authenticate("local", {
		failureFlash: true,
		failureRedirect: "/login",
	}),
	catchAsync(async (req, res) => {
		req.flash("success", "Welcome back to DTUChat");
		// console.log(req.session.returnTo);
		const returnUrl = req.session.returnTo || "/questions";
		delete req.session.returnTo;
		res.redirect(returnUrl);
	})
);

router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "You are successfully logged out");
	res.redirect("/questions");
});

module.exports = router;
