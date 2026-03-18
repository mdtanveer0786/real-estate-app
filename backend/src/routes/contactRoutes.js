'use strict';

const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const { contactSchema } = require('../validators/propertyValidator');
const { submitContact } = require('../controllers/contactController');

router.post('/', validate(contactSchema), submitContact);

module.exports = router;