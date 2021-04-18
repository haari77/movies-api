const express = require('express')
const app = express()

var user_router = require('./routers/mongo/user_router')
var movies_router = require('./routers/mongo/movies_router');

app.use(express.json())
app.use(Logger)
app.use('/api-userService', user_router);
app.use('/api-moviesService', movies_router);

const port = 3000;
app.listen(port, () => console.log(`Running on localhost:${port}`))

function Logger(req, res, next) {
    console.log(`NEW REQUEST -- ${Date.now()}`);
    next()
}