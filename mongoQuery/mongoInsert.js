var MongoClient = require('mongodb').MongoClient;
let dbConnectString = 'mongodb://localhost:27017/';
var fs = require('fs');

// Reading from JSON file and parsing
var rawData = fs.readFileSync('moviedatacomplete.json');
let jsonArray = JSON.parse(rawData)
// let json = { name: String, password: String, createdTime: Long, profile: String, favorites: Array, watchList: Array }
// let jsonArray = [];
// jsonArray.push({ name: "harish", password: "harish", createdTime: new Date(), profile: "adult", favourites: [], watchList: [], status: "active" });

// Connecting to mongo and inserting JSON
MongoClient.connect(dbConnectString, { useNewUrlParser: true },
    function (error, connection) {
        if (error) {
            console.error(error.message);
        } else {

            var dbo = connection.db('moviesDB');

            jsonArray.forEach(e => {
                dbo.collection("movies").insertOne(e);
            });
            doRelease(connection);
        }
    });

//To close connections when needed
function doRelease(connection) {
    connection.close()
}
