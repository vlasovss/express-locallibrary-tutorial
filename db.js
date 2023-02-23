const mongoose  = require('mongoose');

const mongodb = 'mongodb://127.0.0.1/local_library';

mongoose.connect(mongodb);
mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);

module.exports = mongoose.connection;