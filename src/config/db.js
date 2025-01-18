const mongoose = require('mongoose')

const connectDB = (mongoURI) => {
    mongoose.connect(mongoURI) 
            .then(() => { console.log('Mongo Connected'); })
            .catch((err) => { console.log('An error occurred when trying to connect to the server: ' + err); })
}

module.exports = connectDB; 