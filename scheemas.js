const Joi = require("joi"); // tool for validating errors in JavaScript (not express specific) docs: https://joi.dev/api/?v=17.7.0

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
})