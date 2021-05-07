const Joi = require('joi');

const alertSchema = Joi.object({

  objectId: Joi.string().alphanum().required(),
  price: Joi.string().pattern(new RegExp('^[0-9]{1,}.[0-9]{2}$')).required(),
  // isAlertAllowed : Joi.boolean(),
  // name: Joi.string().alphanum().required(),
  // url: Joi.string().alphanum().required(),
  // image: Joi.string().alphanum().required(),
  // date: Joi.date().required(),
  // isPromo: Joi.boolean().required()
});

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(15).required(),
  firstName: Joi.string().alphanum().min(2).max(25).required(),
  lastName: Joi.string().alphanum().min(2).max(25).required(),
  emails: Joi.array().items(Joi.string().email().max(55).required()),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
});

const productSchema = Joi.object({
  name: Joi.string().max(255).required(),
  url: Joi.string().max(255).pattern(new RegExp('^https://www.amazon')).required(),
  image: Joi.string().max(255).required(),
});

const priceSchema = Joi.object({
  objectId: Joi.string().alphanum().required(),
  price: Joi.string().pattern(new RegExp('^[0-9]{1,}.[0-9]{2}$')).required(),
  date: Joi.date().required(),
  isPromo: Joi.boolean().required()
})

module.exports = {
  alertSchema,
  userSchema,
  productSchema,
  priceSchema,
};
