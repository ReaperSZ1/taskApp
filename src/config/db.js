const mongoose = require('mongoose')

const connectDB = (mongoURI) => {
    mongoose.connect(mongoURI) // esse mongouri determina se vai conectar pelo local ou pelo server
            .then(() => { console.log('Mongo Connected'); })
            .catch((err) => { console.log('An error occurred when trying to connect to the server: ' + err); })
}

module.exports = connectDB; 