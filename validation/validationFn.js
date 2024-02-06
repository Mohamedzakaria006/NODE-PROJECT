import AppError from "../utils/appError.js";

export const validationFn = (schema) => {
  return (req, res, next) => {
    const check = schema.validate(req.body, { abortEarly: false });
    if (check && check.error) {
      next(new AppError(check.error, 400));
    }
    next();
  };
};
