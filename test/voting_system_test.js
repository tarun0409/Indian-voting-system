var VS = artifacts.require("Voting_System");

var account0Nonce = "Thanjavur";
var account1Nonce = "Keeladi";
var account2Nonce = "RajarajaChola";
var account3Nonce = "RajendraChola";
var account4Nonce = "Tholkappiyam";
var account5Nonce = "Pandiya";
var account6Nonce = "Chera";
var account7Nonce = "Nonce7";
var account8Nonce = "Nonce8";
var account9Nonce = "Nonce9";

var account0NonceHash = web3.utils.soliditySha3(account0Nonce);
var account1NonceHash = web3.utils.soliditySha3(account1Nonce);
var account2NonceHash = web3.utils.soliditySha3(account2Nonce);
var account3NonceHash = web3.utils.soliditySha3(account3Nonce);
var account4NonceHash = web3.utils.soliditySha3(account4Nonce);
var account5NonceHash = web3.utils.soliditySha3(account5Nonce);
var account6NonceHash = web3.utils.soliditySha3(account6Nonce);
var account7NonceHash = web3.utils.soliditySha3(account7Nonce);
var account8NonceHash = web3.utils.soliditySha3(account8Nonce);
var account9NonceHash = web3.utils.soliditySha3(account9Nonce);

contract('Indian Voting System ::: Test 1',function(accounts){
    it("admin should be able to get list of other admins",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                var sa = await instance.getAdmins();
                test_case_passed = (sa[0] == accounts[0]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Admin not in the array received');
        });
    });
    it("admin should be able add other admins",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.addAdmin(accounts[1]);
                await instance.addAdmin(accounts[2]);
                var sa = await instance.getAdmins();
                test_case_passed = (sa[1] == accounts[1]) && (sa[2] == accounts[2]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Second admin not in the admin list');
        });
    });
    it("admin should be able to register voters",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.registerVoter(accounts[0], {from:accounts[0]});
                await instance.registerVoter(accounts[1], {from:accounts[1]});
                await instance.registerVoter(accounts[2] ,{from:accounts[2]});
                await instance.registerVoter(accounts[3], {from:accounts[0]});
                await instance.registerVoter(accounts[4] ,{from:accounts[1]});
                await instance.registerVoter(accounts[5] ,{from:accounts[2]});
                await instance.registerVoter(accounts[6] ,{from:accounts[0]});
                await instance.registerVoter(accounts[7] ,{from:accounts[1]});
                await instance.registerVoter(accounts[8] ,{from:accounts[2]});
                await instance.registerVoter(accounts[9] ,{from:accounts[0]});

                var reg_voters = await instance.getRegisteredVoters();
                
                test_case_passed = reg_voters.includes(accounts[0]) && reg_voters.includes(accounts[2]) && reg_voters.includes(accounts[4]) && reg_voters.includes(accounts[6]) && reg_voters.includes(accounts[8]) && reg_voters.includes(accounts[9]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'One or more voters not registered.');
        });
    });
    it("admin should be able register candidates",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.registerCandidate(accounts[1], {from:accounts[0]});
                await instance.registerCandidate(accounts[2], {from:accounts[1]});
                await instance.registerCandidate(accounts[3], {from:accounts[2]});
                await instance.registerCandidate(accounts[4], {from:accounts[1]});
                
                var reg_cands = await instance.getRegisteredCandidates();

                test_case_passed = reg_cands.includes(accounts[1]) && reg_cands.includes(accounts[2]) && reg_cands.includes(accounts[3]) && reg_cands.includes(accounts[4]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'One or more candidates not registered.');
        });
    });
    it("registered voters should be able to vote",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                var d = new Date();
                d.setHours(d.getHours() - 2);
                var startDateTime = Math.round(d.getTime()/1000);
                d.setHours(d.getHours() + 4);
                var endDateTime = Math.round(d.getTime()/1000);
                await instance.setElectionDate(startDateTime,endDateTime);
                account0VoteHash = web3.utils.soliditySha3(accounts[4],account0NonceHash);
                await instance.vote(account0VoteHash,{from:accounts[0]});
                var voteCount = await instance.getTotalVotesCast();
                test_case_passed = (voteCount == 1);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Voter not counted.');
        });
    });
    it("admins should be able to get total votes of candidates",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                var account1VoteHash = web3.utils.soliditySha3(accounts[3],account1NonceHash);
                var account2VoteHash = web3.utils.soliditySha3(accounts[3],account2NonceHash);
                var account3VoteHash = web3.utils.soliditySha3(accounts[3],account3NonceHash);
                var account4VoteHash = web3.utils.soliditySha3(accounts[3],account4NonceHash);
                var account5VoteHash = web3.utils.soliditySha3(accounts[2],account5NonceHash);
                var account6VoteHash = web3.utils.soliditySha3(accounts[2],account6NonceHash);
                var account7VoteHash = web3.utils.soliditySha3(accounts[1],account7NonceHash);
                var account8VoteHash = web3.utils.soliditySha3(accounts[1],account8NonceHash);
                var account9VoteHash = web3.utils.soliditySha3(accounts[1],account9NonceHash);
                await instance.vote(account1VoteHash,{from:accounts[1]});
                await instance.vote(account2VoteHash,{from:accounts[2]});
                await instance.vote(account3VoteHash,{from:accounts[3]});
                await instance.vote(account4VoteHash,{from:accounts[4]});
                await instance.vote(account5VoteHash,{from:accounts[5]});
                await instance.vote(account6VoteHash,{from:accounts[6]});
                await instance.vote(account7VoteHash,{from:accounts[7]});
                await instance.vote(account8VoteHash,{from:accounts[8]});
                await instance.vote(account9VoteHash,{from:accounts[9]});

                var d = new Date();
                d.setHours(d.getHours() - 2);
                var startDateTime = Math.round(d.getTime()/1000);
                d.setHours(d.getHours() + 4);
                var endDateTime = Math.round(d.getTime()/1000);
                await instance.setVoteCountDate(startDateTime,endDateTime);

                nonces = Array();
                nonces.push(account0NonceHash);
                nonces.push(account1NonceHash);
                nonces.push(account2NonceHash);
                nonces.push(account3NonceHash);
                nonces.push(account4NonceHash);
                nonces.push(account5NonceHash);
                nonces.push(account6NonceHash);
                nonces.push(account7NonceHash);
                nonces.push(account8NonceHash);
                nonces.push(account9NonceHash);

                var cand1Votes = await instance.getTotalVotesCandidate(accounts[1],nonces);
                var cand2Votes = await instance.getTotalVotesCandidate(accounts[2],nonces);
                var cand3Votes = await instance.getTotalVotesCandidate(accounts[3],nonces);
                var cand4Votes = await instance.getTotalVotesCandidate(accounts[4],nonces);
                test_case_passed = (cand1Votes == 3 && cand2Votes == 2 && cand3Votes == 4 && cand4Votes == 1);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Votes not counted for any of the candidates');
        });
    });
    it("admins should be able to get election winners",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                var d = new Date();
                d.setHours(d.getHours() - 2);
                var startDateTime = Math.round(d.getTime()/1000);
                d.setHours(d.getHours() + 4);
                var endDateTime = Math.round(d.getTime()/1000);
                await instance.setResultDeclareDate(startDateTime,endDateTime);
                await instance.countAllVotes(nonces);
                var winners = await instance.getElectionWinners();

                test_case_passed = (winners[0] == accounts[3]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Winner was not computed properly.');
        });
    });
});