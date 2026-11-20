const { body } = require('express-validator');

const createArticle = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Body is required')
    .isLength({ max: 2000 })
    .withMessage('Body must be under 2000 characters'),
];

const updateArticle = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('body')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Body must be under 2000 characters'),
];

module.exports = { createArticle, updateArticle };
