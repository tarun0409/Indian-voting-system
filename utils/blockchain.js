Web3 = require('web3');
truffleContract = require('truffle-contract');
path = require('path');

App = {};

App.initBlockchainServer = function(port) {
    App.web3Provider = new Web3.providers.HttpProvider("http://localhost:"+port);
    App.web3 = new Web3(App.web3Provider);
}

App.getSmartContract = function() {
    VotingSystem = require(path.join(__dirname, '../build/contracts/Voting_System.json'));
    App.VotingSystemContract = truffleContract(VotingSystem);
    App.VotingSystemContract.setProvider(App.web3Provider);
    return App.VotingSystemContract;
}


module.exports = App;