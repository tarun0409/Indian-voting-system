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
                await instance.add_constituencyAdmin(accounts[2],constituency1_hash);
                await instance.add_constituencyAdmin(accounts[3],constituency2_hash);
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
                await instance.register_votingCentre(votingCentre1, constituency1_hash, {from:accounts[2]});
                await instance.register_votingCentre(votingCentre2, constituency2_hash, {from:accounts[1]});
                await instance.register_votingCentre(votingCentre3, constituency1_hash, {from:accounts[2]});
                await instance.register_votingCentre(votingCentre4, constituency2_hash, {from:accounts[1]});
                
                var registered_hashes = await instance.get_registered_votingCentres_hash();
                test_case_passed = registered_hashes.includes(votingCentre1_hash) && registered_hashes.includes(votingCentre2_hash) && registered_hashes.includes(votingCentre3_hash) && registered_hashes.includes(votingCentre4_hash);
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
                await instance.register_voter(accounts[0], constituency1_hash,{from:accounts[0]}); //super admin 1
                await instance.register_voter(accounts[1], constituency1_hash,{from:accounts[1]}); //super admin 2
                await instance.register_voter(accounts[2], constituency2_hash,{from:accounts[3]}); //const admin 1
                await instance.register_voter(accounts[3], constituency2_hash,{from:accounts[0]}); //super admin 1
                await instance.register_voter(accounts[4], constituency1_hash,{from:accounts[0]}); //super admin 1
                await instance.register_voter(accounts[5], constituency1_hash,{from:accounts[1]}); //super admin 2
                await instance.register_voter(accounts[6], constituency1_hash,{from:accounts[2]}); //const admin 1
                await instance.register_voter(accounts[7], constituency2_hash,{from:accounts[0]}); //super admin 1
                await instance.register_voter(accounts[8], constituency2_hash,{from:accounts[1]}); //super admin 2
                await instance.register_voter(accounts[9], constituency2_hash,{from:accounts[3]}); //const admin 2

                var reg_voters_1 = await instance.get_registered_voters(constituency1_hash);
                var reg_voters_2 = await instance.get_registered_voters(constituency2_hash);
                
                test_case_passed = reg_voters_1.includes(accounts[0]) && reg_voters_1.includes(accounts[1]) && reg_voters_1.includes(accounts[4]) && reg_voters_1.includes(accounts[5]) && reg_voters_1.includes(accounts[6]) && reg_voters_2.includes(accounts[7]) && reg_voters_2.includes(accounts[8]) && reg_voters_2.includes(accounts[9]) && reg_voters_2.includes(accounts[2]) && reg_voters_2.includes(accounts[3]);
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
                await instance.allocate_voter(accounts[4], votingCentre1_hash, {from:accounts[0]});
                await instance.allocate_voter(accounts[5], votingCentre3_hash, {from:accounts[1]});
                await instance.allocate_voter(accounts[6], votingCentre1_hash, {from:accounts[2]});
                await instance.allocate_voter(accounts[7], votingCentre4_hash, {from:accounts[0]});
                await instance.allocate_voter(accounts[8], votingCentre2_hash, {from:accounts[1]});
                await instance.allocate_voter(accounts[9], votingCentre4_hash, {from:accounts[3]});
                
                var alc_voters_1 = await instance.get_allocated_voters(votingCentre1_hash);
                var alc_voters_2 = await instance.get_allocated_voters(votingCentre2_hash);
                var alc_voters_3 = await instance.get_allocated_voters(votingCentre3_hash);
                var alc_voters_4 = await instance.get_allocated_voters(votingCentre4_hash);
                
                test_case_passed = alc_voters_1.includes(accounts[4]) && alc_voters_1.includes(accounts[6]) && alc_voters_2.includes(accounts[8]) && alc_voters_3.includes(accounts[5]) && alc_voters_4.includes(accounts[7]) && alc_voters_4.includes(accounts[9]);
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
                await instance.register_candidate(accounts[0], constituency1_hash, {from:accounts[0]});
                await instance.register_candidate(accounts[3], constituency1_hash, {from:accounts[1]});
                await instance.register_candidate(accounts[7], constituency1_hash, {from:accounts[2]});
                await instance.register_candidate(accounts[2], constituency2_hash, {from:accounts[0]});
                await instance.register_candidate(accounts[4], constituency2_hash, {from:accounts[1]});
                await instance.register_candidate(accounts[9], constituency2_hash, {from:accounts[3]});

                var reg_cands_1 = await instance.get_candidates(constituency1_hash);
                var reg_cands_2 = await instance.get_candidates(constituency2_hash);

                test_case_passed = reg_cands_1.includes(accounts[0]) && reg_cands_1.includes(accounts[3]) && reg_cands_1.includes(accounts[7]) && reg_cands_2.includes(accounts[2]) && reg_cands_2.includes(accounts[4]) && reg_cands_2.includes(accounts[9]);

            }
            catch(e)
            {
                assert(false, 'Exception has occurred ::: '+e.message);
            }
            assert(test_case_passed, 'One or more voters not allocated.');
        });
    });
});