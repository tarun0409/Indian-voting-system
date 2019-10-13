var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoterSchema = new Schema({
    Name:String,
    Public_Key:String,
    Voting_Location:String,
    Status:String,
    Voted:Boolean,
    Comments:String
});

module.exports = mongoose.model('Voter', VoterSchema);