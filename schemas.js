const Joi = require("joi");

const questionSchema = Joi.object({
	questions: Joi.object({
		question: Joi.string().required(),
		author: Joi.string().required(),
	}).required(),
});

module.exports = questionSchema;
