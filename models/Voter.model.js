var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoterSchema = new Schema({
    Name:String,
    Public_Key:String,
    Election_ID:String,
    Voting_Location:String,
    Voted:Boolean,
    Comments:String
});

module.exports = mongoose.model('Voter', VoterSchema);