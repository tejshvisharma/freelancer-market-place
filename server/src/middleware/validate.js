import { validationResult } from "express-validator";
import { ValidationError } from "../utils/api-error.js";

const validate =
  (validations = []) =>
  async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));

      return next(
        new ValidationError(extractedErrors, "Received data is not valid"),
      );
    }

    return next();
  };

export { validate };
