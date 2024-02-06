import Joi from "joi";

export const userValidationSchema = Joi.object({
  userName: Joi.string().alphanum().min(3).max(10).required(),
  email: Joi.string().email(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,8}$")).required(),
  passwordRepeat: Joi.ref("password"),
  phone: Joi.string(),
  address: Joi.object(),
  role: Joi.string(),
});
