var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ElectionSchema = new Schema({
    Name:String,
    Type:String,
    Port:String,
    Start_Datetime:Number,
    End_Datetime:Number,
    Vote_Count_Start_Datetime:Number,
    Vote_Count_End_Datetime:Number,
    Nonces:Array,
    Results_Day:Date,
    Winners:Array,
    Complaints:Array
});

module.exports = mongoose.model('Election', ElectionSchema);