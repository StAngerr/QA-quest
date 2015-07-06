var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bookz');

module.exports = mongoose;