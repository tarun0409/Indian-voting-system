var VS = artifacts.require("Voting_System");

var constituency1 = "Thanjavur";
var constituency1_hash = web3.utils.soliditySha3(constituency1);
var constituency2 = "Keeladi";
var constituency2_hash = web3.utils.soliditySha3(constituency2);
var votingCentre1 = "ABC Higher Secondary School";
var votingCentre1_hash = web3.utils.soliditySha3(votingCentre1);
var votingCentre2 = "Southern Railways Headquarters";
var votingCentre2_hash = web3.utils.soliditySha3(votingCentre2);
var votingCentre3 = "SRM Institute of Info Tech";
var votingCentre3_hash = web3.utils.soliditySha3(votingCentre3);
var votingCentre4 = "Blockchain Infotech";
var votingCentre4_hash = web3.utils.soliditySha3(votingCentre4);

contract('Indian Voting System ::: Test 1',function(accounts){
    it("super admin should be able to get list of other super admins",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                var sa = await instance.get_superAdmins();
                test_case_passed = (sa[0] == accounts[0]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Super admin not in the array received');
        });
    });
    it("super admin should be able add other super admins",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.add_superAdmin(accounts[1]);
                var sa = await instance.get_superAdmins();
                test_case_passed = (sa[1] == accounts[1]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Second super admin not in the super admin list');
        });
    });
    it("super admin should be able to register more than one constituency",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.register_constituency(constituency1);
                await instance.register_constituency(constituency2);
                var registered_hashes = await instance.get_registered_constituencies_hash();
                test_case_passed = registered_hashes.includes(constituency1_hash) && registered_hashes.includes(constituency2_hash);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Either Constituency 1 is not in registered array or Constituency 2 is not in registered.');
        });
    });
    it("super admin should be able to add constituency admins",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.add_constituencyAdmin(constituency1_hash, accounts[2]);
                await instance.add_constituencyAdmin(constituency2_hash, accounts[3]);
                var ca1 = await instance.get_constituency_admins(constituency1_hash);
                var ca2 = await instance.get_constituency_admins(constituency2_hash);
                test_case_passed = (ca1[0] == accounts[2]) && (ca2[0] == accounts[3]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Constituency admins not registered properly.');
        });
    });
    it("super admin and constituency admin should be able to register voting centres",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.register_votingCentre(constituency1_hash, votingCentre1, {from:accounts[2]});
                await instance.register_votingCentre(constituency1_hash, votingCentre2, {from:accounts[2]});
                await instance.register_votingCentre(constituency2_hash, votingCentre3, {from:accounts[3]});
                await instance.register_votingCentre(constituency2_hash, votingCentre4, {from:accounts[3]});
                
                var registered_hashes_1 = await instance.get_registered_votingCentres_hash(constituency1_hash);
                var registered_hashes_2 = await instance.get_registered_votingCentres_hash(constituency2_hash);
                test_case_passed = registered_hashes_1.includes(votingCentre1_hash) && registered_hashes_1.includes(votingCentre2_hash) && registered_hashes_2.includes(votingCentre3_hash) && registered_hashes_2.includes(votingCentre4_hash);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Either Voting centre 1 is not in registered array or Voting centre 2 is not in registered.');
        });
    });
    it("super admin or constituency admin should be able to register voters",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.register_voter(constituency1_hash, accounts[0], {from:accounts[0]}); //super admin 1
                await instance.register_voter(constituency1_hash, accounts[1], {from:accounts[2]}); //super admin 2
                await instance.register_voter(constituency1_hash, accounts[2] ,{from:accounts[0]}); //const admin 1
                await instance.register_voter(constituency1_hash, accounts[3], {from:accounts[2]}); //super admin 1
                await instance.register_voter(constituency1_hash, accounts[4] ,{from:accounts[0]}); //super admin 1
                await instance.register_voter(constituency2_hash, accounts[5] ,{from:accounts[3]}); //super admin 2
                await instance.register_voter(constituency2_hash, accounts[6] ,{from:accounts[1]}); //const admin 1
                await instance.register_voter(constituency2_hash, accounts[7] ,{from:accounts[3]}); //super admin 1
                await instance.register_voter(constituency2_hash, accounts[8] ,{from:accounts[1]}); //super admin 2
                await instance.register_voter(constituency2_hash, accounts[9] ,{from:accounts[3]}); //const admin 2

                var reg_voters_1 = await instance.get_registered_voters(constituency1_hash);
                var reg_voters_2 = await instance.get_registered_voters(constituency2_hash);
                
                test_case_passed = reg_voters_1.includes(accounts[0]) && reg_voters_1.includes(accounts[2]) && reg_voters_1.includes(accounts[3]) && reg_voters_2.includes(accounts[5]) && reg_voters_2.includes(accounts[7]) && reg_voters_2.includes(accounts[9]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'One or more voters not registered.');
        });
    });
    it("super admin or constituency admin should be able to allocate voters to voting centres",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.allocate_voter(constituency1_hash, votingCentre1_hash, accounts[0], {from:accounts[0]});
                await instance.allocate_voter(constituency1_hash, votingCentre1_hash, accounts[1], {from:accounts[2]});
                await instance.allocate_voter(constituency1_hash, votingCentre2_hash, accounts[2], {from:accounts[0]});
                await instance.allocate_voter(constituency1_hash, votingCentre2_hash, accounts[3], {from:accounts[2]});
                await instance.allocate_voter(constituency1_hash, votingCentre2_hash, accounts[4], {from:accounts[2]});
                
                await instance.allocate_voter(constituency2_hash, votingCentre3_hash, accounts[5], {from:accounts[1]});
                await instance.allocate_voter(constituency2_hash, votingCentre3_hash, accounts[6], {from:accounts[3]});
                await instance.allocate_voter(constituency2_hash, votingCentre4_hash, accounts[7], {from:accounts[1]});
                await instance.allocate_voter(constituency2_hash, votingCentre4_hash, accounts[8], {from:accounts[3]});
                await instance.allocate_voter(constituency2_hash, votingCentre4_hash, accounts[9], {from:accounts[1]});
                
                var alc_voters_1 = await instance.get_allocated_voters(constituency1_hash, votingCentre1_hash);
                var alc_voters_2 = await instance.get_allocated_voters(constituency1_hash, votingCentre2_hash);
                var alc_voters_3 = await instance.get_allocated_voters(constituency2_hash, votingCentre3_hash);
                var alc_voters_4 = await instance.get_allocated_voters(constituency2_hash, votingCentre4_hash);
            
                test_case_passed = alc_voters_1.includes(accounts[0]) && alc_voters_2.includes(accounts[3]) && alc_voters_3.includes(accounts[6]) && alc_voters_4.includes(accounts[9]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'One or more voters not allocated.');
        });
    });
    it("super admin or constituency admin should be able register candidates",function(){
        return VS.deployed().then(async function(instance)
        {
            var test_case_passed = false;
            try
            {
                await instance.register_candidate(constituency1_hash, accounts[0], {from:accounts[0]});
                await instance.register_candidate(constituency1_hash, accounts[3], {from:accounts[2]});
                await instance.register_candidate(constituency1_hash, accounts[6], {from:accounts[0]});
                await instance.register_candidate(constituency1_hash, accounts[9], {from:accounts[2]});
                
                await instance.register_candidate(constituency2_hash, accounts[1], {from:accounts[1]});
                await instance.register_candidate(constituency2_hash, accounts[5], {from:accounts[3]});
                await instance.register_candidate(constituency2_hash, accounts[7], {from:accounts[1]});
                await instance.register_candidate(constituency2_hash, accounts[8], {from:accounts[3]});

                var reg_cands_1 = await instance.get_candidates(constituency1_hash);
                var reg_cands_2 = await instance.get_candidates(constituency2_hash);

                test_case_passed = reg_cands_1.includes(accounts[0]) && reg_cands_1.includes(accounts[9]) && reg_cands_2.includes(accounts[5]) && reg_cands_2.includes(accounts[7]);
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'One or more voters not allocated.');
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
                await instance.set_electionDate(constituency1_hash,startDateTime,endDateTime);
                await instance.vote(constituency1_hash,votingCentre1_hash,accounts[3],{from:accounts[1]});
                var voted = await instance.get_voterStatus(constituency1_hash, accounts[1]);
                test_case_passed = voted;
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Voter status not changed.');
        });
    });
    it("super admins or constituency admins should be able to count votes",function(){
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
                await instance.set_voteCountDate(constituency1_hash,startDateTime,endDateTime);
                
                await instance.vote(constituency1_hash,votingCentre2_hash,accounts[0],{from:accounts[4]});
                await instance.vote(constituency1_hash,votingCentre1_hash,accounts[3],{from:accounts[0]});
                await instance.vote(constituency1_hash,votingCentre2_hash,accounts[0],{from:accounts[2]});
                await instance.vote(constituency1_hash,votingCentre1_hash,accounts[3],{from:accounts[3]});

                var vc_votes = await instance.get_totalVotes_votingCentre(constituency1_hash, votingCentre1_hash);
                var c_votes = await instance.get_totalVotes_constituency(constituency1_hash);
                var cand_votes = await instance.get_totalVotes_candidate(constituency1_hash, accounts[3]);

                test_case_passed = (vc_votes == 2) && (c_votes == 5) && (cand_votes == 3);
                
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Vote totalling did not tally.');
        });
    });
    it("super admins or constituency admins should be able to declare constituency winner",function(){
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
                await instance.set_resultDeclareDate(constituency1_hash,startDateTime,endDateTime);
                await instance.compute_constituency_winner(constituency1_hash);
                var winners = await instance.get_constituency_winners(constituency1_hash);
                test_case_passed = winners[0] == accounts[3];
                
            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'Winner not in the list.');
        });
    });
});