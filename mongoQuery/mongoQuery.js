var MongoClient = require('mongodb').MongoClient;
let dbConnectString = 'mongodb://localhost:27017/';
const client = new MongoClient(dbConnectString);

const getAll = function () {
    client.connect(function (err) {
        if (err) {
            console.log(err)
            return err
        } else {
            const db = client.db("moviesDB");
            const coll = db.collection("movies");
            coll.find({ release_date: { $gt: 1563299200 } }).toArray(function (err, docs) {
                if (err) {
                    console.log(err);

                } else {
                    docs.forEach(e => {
                        console.log(e.title);
                    })
                }
            });
        }
        doRelease(client);
    })
}

const getRecentMovies = function () {
    client.connect(function (err) {
        if (err) {
            console.log(err)
            return err
        } else {
            const db = client.db("moviesDB");
            const coll = db.collection("movies");
            coll.aggregate([
                { $sort: { release_date: -1 } },
                { $limit: 15 }
            ]).toArray(function (error, result) {
                if (error) {
                    console.log(error.message)
                }
                result.forEach(res => {
                    console.log(`${res.title} released ${res.release_date}`);
                })
            })
        }
        doRelease(client);
    })
}


getRecentMovies();

//To close connections when needed
function doRelease(connection) {
    connection.close()
}