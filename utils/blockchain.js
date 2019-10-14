Web3 = require('web3');
truffleContract = require('truffle-contract');
path = require('path');

getSmartContract = function(port) {
    VotingSystem = require(path.join(__dirname, '../build/contracts/Voting_System.json'));
    var web3Provider = new Web3.providers.HttpProvider("http://localhost:"+port);
    // filePath = path.join(__dirname,'../build/contracts/Voting_System.json');

    var VotingSystemContract = truffleContract(VotingSystem);
    VotingSystemContract.setProvider(web3Provider);
    return VotingSystemContract;
}

module.exports = getSmartContract;