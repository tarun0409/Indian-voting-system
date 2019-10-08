const tvs = artifacts.require("./Voting_System");

module.exports = function(deployer){
    deployer.deploy(tvs);
}