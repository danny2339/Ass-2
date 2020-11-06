var express = require('express');
var router = express.Router();
var multer = require('multer');
var upFullname = "";
var upNumber = 0;
/// ------------------ upload
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, xcallback) {
        xcallback(null, 'uploads')
    },
    filename: function (req, file, xcallback) {
        console.log(file);
        var slist = file.originalname.trim().split(".");
        var f_ext = "";
        if (slist.length > 1) {
            f_ext = "." + slist[slist.length-1];
        }
        upNumber++;
        xcallback(null, upFullname + "-" + upNumber  + f_ext);
    }
});
var uploadStore = multer({ storage: storage });


/// --- Code CONTROLLERs
router.use(function timeLog (req, res, next) {
    upFullname = "" + Date.now();
    upNumber = 0;
    console.log('\n\t UPLOAD controller - Time: ', upFullname);
    next();
})

/// ..................................................
router.get('/', uploadPage);
router.post('/', uploadPage);
function uploadPage(req, res) {
    router.params.currpage = "Upload";
    res.render("pages/upload", router.params);
    console.log(req.files);
}

router.post('/multiple', uploadStore.array('upfiles', 12), (req, res, next) => {
    const files = req.files
    if (!files) {
        const error = new Error('Please choose files');
        error.httpStatusCode = 400;
        return next(error);
    }
   
    res.send(files);
    
})



/// --- EXports
module.exports = router;

