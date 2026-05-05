import { validationResult } from "express-validator";
import { ValidationError } from "../utils/api-error.js";

const validate = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const extractedErrors = errors.array().map((err) => ({
			field: err.path,
			message: err.msg,
		}));

		return next(new ValidationError(extractedErrors, "Received data is not valid"));
	}

	return next();
};

export { validate };
