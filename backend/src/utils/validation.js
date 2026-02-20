const { body, validationResult } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
            })),
        });
    };
};

const propertyValidation = [
    body('title').notEmpty().withMessage('Title is required').isLength({ min: 5, max: 100 }),
    body('description').notEmpty().withMessage('Description is required').isLength({ min: 20 }),
    body('price').isNumeric().withMessage('Price must be a number').custom(value => value > 0),
    body('type').isIn(['buy', 'rent']).withMessage('Invalid property type'),
    body('propertyType').isIn(['apartment', 'house', 'villa', 'commercial']),
    body('bedrooms').isInt({ min: 0 }),
    body('bathrooms').isInt({ min: 0 }),
    body('area.value').isNumeric().withMessage('Area value must be a number'),
    body('area.unit').isIn(['sqft', 'sqm']),
    body('location.address').notEmpty(),
    body('location.city').notEmpty(),
    body('location.state').notEmpty(),
    body('location.pincode').matches(/^\d{6}$/).withMessage('Invalid pincode'),
];

const userValidation = {
    register: [
        body('name').notEmpty().withMessage('Name is required').isLength({ min: 2 }),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    login: [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
};

const inquiryValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').matches(/^\d{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('message').notEmpty().withMessage('Message is required'),
];

module.exports = {
    validate,
    propertyValidation,
    userValidation,
    inquiryValidation,
};