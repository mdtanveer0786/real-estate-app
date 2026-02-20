const express = require('express');
const router = express.Router();
const {
    getSearchSuggestions,
    advancedSearch,
} = require('../controllers/searchController');

router.get('/suggestions', getSearchSuggestions);
router.post('/advanced', advancedSearch);

module.exports = router;