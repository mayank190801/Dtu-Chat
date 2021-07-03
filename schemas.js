const Joi = require("joi");

module.exports.questionSchema = Joi.object({
	questions: Joi.object({
		question: Joi.string().required(),
		description: Joi.string(),
	}).required(),
});

module.exports.answerSchema = Joi.object({
	answer: Joi.object({
		answer: Joi.string().required(),
	}).required(),
});
