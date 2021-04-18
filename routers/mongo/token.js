require('dotenv').config();
const jwt = require('jsonwebtoken');

const tokenGenrator = function (userdetails) {
    const token = jwt.sign(userdetails, process.env.TOKEN_SECRET);
    return token
}

const verifyToken = function (req, res, next) {
    if (req.headers.api_token) {
        jwt.verify(req.headers.api_token, process.env.TOKEN_SECRET, (error, details) => {
            if (error) {
                console.log(error);
                res.status(401);
                res.send({ status: 'failed' });
            } else {
                req.details = details;
                next();
            }
        })
    } else {
        res.status(401);
        res.send({ status: 'failed' });
    }
}

module.exports = { tokenGenrator, verifyToken }