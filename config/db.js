const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI_DEV, {
        useNewUrlParser : true,
        useCreateIndex : true,
        useFindAndModify :false ,
        useUnifiedTopology : true
    });
    console.log(`MongoDB Connected on  : ${conn.connection.host}`.black.bgWhite);
}

module.exports = connectDB;

