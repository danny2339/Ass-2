var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Product = require('../models/product');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, xcallback) {
        xcallback(null, 'public/images');
    },
    filename: function (req, file, xcallback) {
        xcallback(null, file.originalname);
    }
});
var uploadStore = multer({ storage: storage });

const dbname = 'ATNShop';
const uri = 'mongodb://localhost:27017/' + dbname;

/// --- Code CONTROLLERs
function productViewPage(req, res) {
    
    if (session.user) 
    {
        MongoClient.connect(urldb, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("ATNShop");
            dbo.collection("Toys").find({}).toArray(function(err, productlist) {
              if (err) throw err;
              
                res.render("pages/product-list",  {
                    title: "ATN-Shop PRODUCT page", 
                    username: session.user.username,
                    products : productlist 
                    , configHeader: configHeader , currpage: "Product"
                    });
                console.log('Found:', productlist);

              db.close();
            });
          });
                    

        
    } else {
        res.redirect('/login');
    }    
    console.log("\n\t ... connect PRODUCT from ", req.connection.remoteAddress, req.headers.host);
}

/// --- EXports
module.exports = router;


