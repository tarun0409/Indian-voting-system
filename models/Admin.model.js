var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = new Schema({
    Name:String,
    Public_Key:String,
    Phone_Number:String,
    Address:String,
    Comments:String
});

module.exports = mongoose.model('Admin', AdminSchema);