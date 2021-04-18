require('dotenv').config()
const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
const token = require('./token');

//To close connections when needed
function doRelease(connection) {
    connection.close()
    console.log(`CONNECTON CLOSED`)
}

router.get('/login', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    console.log("LOGIN -- ", Date.now(), username);
    let query = new Promise((resove, reject) => {
        MongoClient.connect(process.env.MONGO, { useNewUrlParser: true }, function (error, client) {
            if (error) {
                console.log(error)
                response.status(503);
                response.send(`Error while connecting mongoDB -- ${error}`);
            } else {
                let db = client.db("moviesDB");
                let coll = db.collection("users");
                coll.aggregate([
                    { $match: { $and: [{ name: username }] } },
                    { $project: { _id: 0, favourites: 0, watchList: 0 } }
                ]).toArray(function (error, result) {
                    if (error) {
                        response.status(500);
                        reject(`Error in mongoDB -- ${error}`);
                    } else {
                        if (result.length == 0) {
                            response.status(404);
                            reject('USERNAME NOT FOUND');
                        } else {
                            if (password !== result[0].password) {
                                response.status(401);
                                response.send('INVALID CREDENTIALS');
                                return;
                            }
                            delete result[0].password
                            let userToken = jwt.sign(result[0], process.env.TOKEN_SECRET);
                            let data = { client: client, result: { userToken: userToken } };
                            resove(data);
                        }
                    }
                })
            }
        })
    }).then((data) => {
        response.json(data.result);
        doRelease(data.client);
    }).catch((error) => {
        response.send(`${error}`);
    })
})

router.get('/verifyToken', (request, response) => {
    const userToken = request.body.userToken;
    console.log("VERIFY -- ", Date.now());
    jwt.verify(userToken, process.env.TOKEN_SECRET, (error, details) => {
        if (error) {
            response.status(401);
            response.send(error);
        } else {
            response.send(details);
        }
    })
})

router.put('/favourites/:id', token.verifyToken, (request, response) => {
    console.log("FAV PUT -- ", Date.now());
    const id = request.params.id;
    console.log(id)

    let query = new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGO, { useNewUrlParser: true }, function (error, client) {
            if (error) {
                console.log(error)
                response.status(503);
                reject(`Error while connecting mongoDB -- ${error}`);
            } else {
                const db = client.db("moviesDB");
                const coll = db.collection("users");
                let cond = { name: request.details.name };
                let set = { $addToSet: { favourites: id }, }
                coll.findOneAndUpdate(cond, set, (error, result) => {
                    if (error) {
                        response.status(500)
                        reject(error)
                    } else {
                        let data = { result: result, client: client };
                        resolve(data)
                    }
                })
            }
        })
    }).then((data) => {
        response.send(data.result)
        doRelease(data.client)
    }).catch((error) => {
        response.send(`ERROR -- ${error}`)
    })
});

router.delete('/favourites/:id', token.verifyToken, (request, response) => {
    console.log("FAV PATCH -- ", Date.now());
    const id = request.params.id;
    console.log(id)

    let query = new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGO, { useNewUrlParser: true }, function (error, client) {
            if (error) {
                console.log(error)
                response.status(503);
                reject(`Error while connecting mongoDB -- ${error}`);
            } else {
                const db = client.db("moviesDB");
                const coll = db.collection("users");
                let cond = { name: request.details.name };
                let set = { $pull: { favourites: id }, }
                coll.findOneAndUpdate(cond, set, (error, result) => {
                    if (error) {
                        response.status(500)
                        reject(error)
                    } else {
                        let data = { result: result, client: client };
                        resolve(data)
                    }
                })
            }
        })
    }).then((data) => {
        response.send(data.result)
        doRelease(data.client)
    }).catch((error) => {
        response.send(`ERROR -- ${error}`)
    })
});


router.put('/watchList/:id', token.verifyToken, (request, response) => {
    console.log("WATCH PUT -- ", Date.now());
    const id = request.params.id;
    console.log(id)

    let query = new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGO, { useNewUrlParser: true }, function (error, client) {
            if (error) {
                console.log(error)
                response.status(503);
                reject(`Error while connecting mongoDB -- ${error}`);
            } else {
                const db = client.db("moviesDB");
                const coll = db.collection("users");
                let cond = { name: request.details.name };
                let set = { $addToSet: { watchList: id }, }
                coll.findOneAndUpdate(cond, set, (error, result) => {
                    if (error) {
                        response.status(500)
                        reject(error)
                    } else {
                        let data = { result: result, client: client };
                        resolve(data)
                    }
                })
            }
        })
    }).then((data) => {
        response.send(data.result)
        doRelease(data.client)
    }).catch((error) => {
        response.send(`ERROR -- ${error}`)
    })
});

router.delete('/watchList/:id', token.verifyToken, (request, response) => {
    console.log("WATCH DELETE -- ", Date.now());
    const id = request.params.id;
    console.log(id)

    let query = new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGO, { useNewUrlParser: true }, function (error, client) {
            if (error) {
                console.log(error)
                response.status(503);
                reject(`Error while connecting mongoDB -- ${error}`);
            } else {
                const db = client.db("moviesDB");
                const coll = db.collection("users");
                let cond = { name: request.details.name };
                let set = { $pull: { watchList: id }, }
                coll.findOneAndUpdate(cond, set, (error, result) => {
                    if (error) {
                        response.status(500)
                        reject(error)
                    } else {
                        let data = { result: result, client: client };
                        resolve(data)
                    }
                })
            }
        })
    }).then((data) => {
        response.send(data.result)
        doRelease(data.client)
    }).catch((error) => {
        response.send(`ERROR -- ${error}`)
    })
});

module.exports = router