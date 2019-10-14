var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ElectionSchema = new Schema({
    Name:String,
    Type:String,
    Port:String,
    Election_Day:Date,
    Vote_Count_Day:Date,
    Results_Day:Date,
    Winners:Array,
    Complaints:Array
});

module.exports = mongoose.model('Election', ElectionSchema);