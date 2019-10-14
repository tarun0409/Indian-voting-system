var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CandidateSchema = new Schema({
    Name:String,
    Public_Key:String,
    Election_ID:String,
    Party:String,
    Status:String,
    Total_Votes:Number,
    Proposal:String
});

module.exports = mongoose.model('Candidate', CandidateSchema);