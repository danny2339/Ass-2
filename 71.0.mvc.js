/// INSTALL
/// npm install express  body-parser  cookie-parser multer ejs mongodb mongoose  express-session cookie-session qrcode  qrcode-svg  --save

/// ------------------ Khai bao LIB de su dung
var express = require('express');
var session = require('express-session');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var router = express.Router();
const bodyParser= require('body-parser');
var multer = require('multer');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var app = express();

var os = require('os');
var fs = require('fs');
var path = require('path');
var QRCode = require("qrcode-svg");
var atob = require('atob');



/// ------------------ CONFIG
var configHeader = require("./configs/config_Header");
var configDB = require("./configs/config_DB");
const PORT = 8081;
var urldb = configDB.localdb.urldb;


/// ------------------ Khai bao LIB tự viết
var libDB = require("./libs/libDB_Query");

/// ------------------ Khai bao cac Folder Tĩnh, Session, Cookies
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
/// session
app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: 'ASQ.AdTekDev', 
    cookie: { 
        maxAge: 600000,
        views: 1,
        }
        })
    );
/// engine
app.set('views', path.join( __dirname, 'views'));
app.set('view engine', 'ejs');

//////////////////////////////////////////////////////////////
/// ------------------ VAR - global
var chattingLog = [];

/// ------------------ ROUTer - ROUTing
var adminControl = require('./controllers/admin');
app.use('/admin', adminControl);

var productControl = require('./controllers/product');
app.use('/product', productControl);
productControl.params = { configHeader: configHeader, configDB: configDB};

var uploadControl = require('./controllers/upload');
app.use('/upload', uploadControl);
uploadControl.params = { configHeader: configHeader, configDB: configDB};
// uploadControl.uploadStore = uploadStore;

/// ------------------ Khai bao cac Control, hàm , ... 
/// ..................................................
app.get('/', homePage);
function homePage(req, res) {
    if (session.user) 
    {
        res.render("pages/home", {title: "ATN-Shop Home page", username: session.user.username, configHeader: configHeader, currpage: "Home" });
    } else {
        res.render("pages/home", {title: "ATN-Shop Home page", username: null , configHeader: configHeader , currpage: "Home" });
    }    
    console.log("\n\t ... connect from ", req.connection.remoteAddress, req.headers.host);
}


/// ..................................................
app.get('/product', productViewPage);
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


/// ..................................................
app.get('/chatting', chattingPage);
function chattingPage(req, res) {
    var xcontent = "";
    

    console.log('\t ... CHATTING page ! ');    
    ///
    if (session.user) {
        if (req.query.message && req.query.message.trim() != "") {
            xcontent = req.query.message.trim();
            var newmsg = {
                time: (new Date()).getDate(),
                name: session.user.username,
                message: xcontent,
            };
            chattingLog.push(newmsg);
            console.log("\n\t ", xcontent);
        }

        res.render("pages/chatting", {title: "CHATTING page", 
            content: xcontent , itemlist: chattingLog,  // Object.values(itemlist)
            configHeader: configHeader  , currpage: "Chatting"  });
    } else {
        res.redirect('/login');
    }  
}


/// ..................................................
app.get('/order', orderPage);
function orderPage(req, res) {
    var xcontent = "";

    console.log('\t ... get ORDER INF ! ');

    var strtext = req.cookies.cart_itemlist;
    xcontent += "<BR><p> " + strtext + "</p>";
    //
    strtext = atob(strtext);
    xcontent += "<BR>atob <p> " + strtext + "</p>";
    //
    strtext = escape(strtext);
    xcontent += "<BR>escape <p> " + strtext + "</p>";
    //
    strtext = decodeURIComponent(strtext);
    xcontent += "<BR>decodeURIComponent <p> " + strtext + "</p>";
    ///
    var itemlist  = JSON.parse(strtext);

    console.log("\n\t ", xcontent);
    
    res.render("pages/order", {title: "ATN-Shop ORDER page", 
        content: xcontent , itemlist: itemlist,  // Object.values(itemlist)
        configHeader: configHeader  , currpage: "Order"  });

}



/// ..................................................
app.get('/user/create', createUserPage);
function createUserPage(req, res) {
    if (session.user) {
        if (req.query.username && req.query.username.trim() != "") {
            accsubmit = {
                username : req.query.username.trim(),
                password : req.query.password.trim()
            };
            session.user = accsubmit;
            libDB.res_insertDB(MongoClient, urldb, "newshop", "user",
                accsubmit, "pages/user_create", {title: "ATN-Shop create USER page" , configHeader: configHeader , currpage: "create User"}, "Notify", res );
            console.log("\t create ", accsubmit);
        } else {
            res.render("pages/user_create", {title: "ATN-Shop create USER page", Notify: "", configHeader: configHeader , currpage: "create User" });
        }
        console.log("\t /user/create ");
    } else {
        res.redirect('/login');
    }
}

/// ..................................................
app.get('/login', loginPage);
function loginPage(req, res) {
    if (session.user) {
        res.redirect('/');
    } else {
        if (req.query.username && req.query.username.trim() != "") {
            accsubmit = {
                username : req.query.username.trim(),
                password : req.query.password.trim()
            };
            session.user = accsubmit;
            res.redirect('/');
            console.log(accsubmit);
        } else {
            res.render("pages/login", {title: "ATN-Shop LOGIN page", configHeader: configHeader , currpage: "Login"  });
        }
        console.log("\t login ", req.session);
    }
}

/// ..................................................
app.get('/logout', logoutPage);
function logoutPage(req, res) {
    session.user = null;
    res.redirect('/');
}

/// ..................................................
app.get('/quit', quitPage);
function quitPage(req, res) {
    res.send(' shutdown SERVER !!! ... ');
    console.log('\t shutdown SERVER !!! ... ');
    process.exit(0);
}

/// ..................................................
app.get('/music', musicPage);
function musicPage(req, res) {
    res.send('<html><body>'
    +
    '<embed name="GoodEnough" src="clsmusic.mp3" loop="true" hidden="true" autostart="true">'
    // <audio src="clsmusic.mp3" loop=infinite> </audio> 
    + '</body></html>');
}


/// ..................................................
app.get('/infor', inforPage);
function inforPage(req, res) {
    var inter = os.networkInterfaces();
    res.send(JSON.stringify( inter ));
    console.log('\t ... get INF ! ');
    for(var key in inter) {
        if (key.indexOf("Wi-Fi") >= 0) {            
            console.log( inter[key][1]["address"] );
        }
    }
}


/// ..................................................
app.get('/client', clientPage);
function clientPage(req, res) {
    var clientinf = {
        clientAddress: req.connection.remoteAddress ,
        connectHost: req.headers.host,
        AgentInfor: req.headers['user-agent']
    };



    res.render("pages/client", clientinf);
    console.log('\n\n\t ....... ', clientinf);

    /// LOG
    writeLog(clientinf);
}

function writeLog(dataw) {
    var today = new Date();
    var dd = today.getDate();

    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    var wday = [ "CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    var gd = today.getDay();
    
    var strDate = "" + yyyy + "_" + mm + "_" + dd + "_" + wday[gd] + ".log";

    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var ms = today.getMilliseconds();

    var strTime = "" + h + ":" + m + ":" + s + "." + ms;

    /// FILE
    var writeStream = fs.createWriteStream( __dirname + "/logs/" + strDate , {flags:'a'} );
    writeStream.on('error', (err) => {
        console.log("\n\n ...ERR: ", err);
    });

    writeStream.write( 
        "\n\n" + strTime + "\n" + JSON.stringify(dataw)
        //,(err) => { console.log("\n\n ...ERR: ", err)}
        );
    writeStream.end();
}

/// ..................................................
app.get('/qr', qrPage);
function qrPage(req, res) {
    var inter = os.networkInterfaces();
    var xcontent = "";

    console.log('\t ... get QR INF ! ');
    for(var key in inter) {
        if (key.indexOf("Wi-Fi") >= 0) {             
            var str = "http://" + 
                inter[key][1]["address"] + ":"
                + PORT + "/client";
            var sv = new QRCode({
                content: str,
                padding: 4,
                width: 512,
                height: 512,
                color: "#000000",
                background: "#ffffff",
                ecl: "M",
            }).svg();
            
            xcontent += "<br>" + sv;

            console.log("\n\t", inter[key][1]["address"] );

            str = "https://www.facebook.com/Tu.NN79/";
            sv = new QRCode({
                content: str,
                padding: 4,
                width: 512,
                height: 512,
                color: "#000000",
                background: "#ffffff",
                ecl: "M",
            }).svg();
            xcontent += "<br>" + sv;

            res.render("pages/qr", {title: "ATN-Shop QR-Code page", content: xcontent , configHeader: configHeader  , currpage: "QR code - link"  });

        }
    }
}


/// ------------------ gọi SERVER thực thi


var server = app.listen( PORT , function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("SERVER http://%s:%s", host, port)
});