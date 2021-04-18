require('dotenv').config()
const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const token = require('./token');

//To close connections when needed
function doRelease(connection) {
    connection.close()
    console.log(`CONNECTON CLOSED`)
}

router.get('/recentRelease', token.verifyToken, (request, response) => {
    console.log("RECENT RELEASE -- ", Date.now());
    let genreFilter = []
    if (request.details.profile === 'kids') {
        genreFilter = ['Action', 'Thriller', 'Horror', 'Crime'];
    }
    let query = new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGO, { useNewUrlParser: true }, function (error, client) {
            if (error) {
                console.log(error)
                response.status(503);
                reject(`Error while connecting mongoDB -- ${error}`);
            } else {
                const db = client.db("moviesDB");
                const coll = db.collection("movies");
                coll.aggregate([
                    { $project: { _id: 0 } },
                    { $match: { genres: { $nin: genreFilter } } },
                    { $sort: { release_date: -1 } },
                    { $limit: 20 }
                ])
                    .toArray(function (error, result) {
                        if (error) {
                            response.status(500);
                            response.send(`Error in mongoDB -- ${error}`);
                        }
                        let data = { result: result, client: client }
                        resolve(data)
                    })
            }
        })
    }).then((data) => {
        response.json(data.result);
        doRelease(data.client);
    }).catch((error) => {
        response.send(`${error}`)
    })
})

router.get('/genreType/:genre', token.verifyToken, (request, response) => {
    console.log("GENRE -- ", Date.now());
    const genre = request.params.genre;
    console.log(genre)
    let genreFilter = []
    if (request.details.profile === 'kids') {
        genreFilter = ['Action', 'Thriller', 'Horror', 'Crime'];
    }
    let query = new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGO, { useNewUrlParser: true }, function (error, client) {
            if (error) {
                console.log(error)
                response.status(503);
                reject(`Error while connecting mongoDB -- ${error}`);
            } else {
                const db = client.db("moviesDB");
                const coll = db.collection("movies");
                coll.aggregate([
                    { $project: { _id: 0 } },
                    { $match: { genres: { $nin: genreFilter } } }
                    // , { $limit: 5 }
                ]).toArray(function (error, result) {
                    if (error) {
                        response.status(500);
                        response.send(`Error in mongoDB -- ${error}`);
                    }
                    let data = { result: result, client: client }
                    resolve(data);
                })
            }
        })
    }).then((data) => {
        data.result = data.result.filter((e) => {
            if (e.genres != null) return e.genres.includes(genre)
        })
        response.json(data.result)
        doRelease(data.client)
    }).catch((error) => {
        response.send(`ERROR -- ${error}`)
    })
})


module.exports = router