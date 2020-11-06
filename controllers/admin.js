var express = require('express');
var router = express.Router();

/// --- Code CONTROLLERs
router.use(function timeLog (req, res, next) {
    console.log('\n\t Admin controller - Time: ', Date.now());
    next();
})

/// ..................................................
router.get('/', adminPage);
function adminPage(req, res) {
    res.send('ADMIN: home page');
}

/// ..................................................
router.get('/adduser', addUserPage);
function addUserPage(req, res) {
    res.send('ADMIN: Add user page');
}


/// ..................................................
router.get('/addproduct', addProductPage);
function addProductPage(req, res) {
    res.send('ADMIN: Add PRODUCT page');
}

/// --- EXports
module.exports = router;
