
function res_queryDB(MongoClient, urldb, dbname, collectionname, renderpage, params, resultname, res ) {
    MongoClient.connect(urldb, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db( dbname ); //"newshop" "product"
        dbo.collection( collectionname ).find({}).toArray(function(err, resultlist) {
            if (err) throw err;
            // "pages/product-list"
            params[resultname] = resultlist;
            res.render( renderpage ,  params );
            console.log('\t Found:', resultlist);
            ///////////
            db.close();
        });
    });
}


function res_insertDB(MongoClient, urldb, dbname, collectionname, insertData, renderpage, params, resultname, res ) {
    MongoClient.connect(urldb, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db( dbname ); //"newshop" "product"
        dbo.collection( collectionname ).insertOne(insertData, function(err, xres) {
            if (err) throw err;
            params[resultname] = "Insert DATA ok !";
            res.render( renderpage ,  params );
            console.log('\t Insert:', insertData);
            ///////////
            db.close();
        });
    });
}


module.exports = {
    res_queryDB : res_queryDB,
    res_insertDB: res_insertDB
}