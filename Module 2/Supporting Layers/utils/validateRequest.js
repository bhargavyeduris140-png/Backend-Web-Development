const { validationResult } = require('express-validator');
const AppError = require('./AppError');

module.exports = function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = new AppError('Validation failed', 422);
    error.details = result.array();
    return next(error);
  }
  return next();
};
