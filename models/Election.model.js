var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ElectionSchema = new Schema({
    Name:String,
    Type:String,
    Election_Day:Date,
    Vote_Count_Day:Date,
    Results_Day:Date,
    Admins:Array,
    Candidates:Array,
    Voters:Array,
    Winners:Array,
    Complaints:Array
});

module.exports = mongoose.model('Election', ElectionSchema);