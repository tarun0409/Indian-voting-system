pragma solidity >=0.4.22 <0.6.0;

contract Voting_System
{
    address[] private super_admins;
    mapping (bytes32 => address[]) private constituencies_to_admins;
    mapping (address => uint) private vote_count;
    uint private total_admissible_voters;
    uint private total_votes_cast;
    uint private total_constituencies;
    bytes32[] private registered_constituencies;
    mapping (bytes32 => address[]) private constituency_to_voters;
    mapping (bytes32 => address[]) private votingCentre_to_voters;
    mapping (bytes32 => bytes32[]) private constituency_to_votingCentres;
    mapping (bytes32 => address[]) private constituency_to_candidates;
    mapping (bytes32 => uint256[]) private constituency_to_electionDateTime;
    mapping (bytes32 => uint256[]) private constituency_to_voteCountDateTime;
    mapping (bytes32 => uint256[]) private constituency_to_resultDeclareCountDateTime;
    mapping (address => bool) private voter_to_votingStatus;
    address[] private winning_candidates;

    constructor (uint total_consts) public {
        total_constituencies = total_consts;
        total_admissible_voters = 0;
        total_votes_cast = 0;
        super_admins.push(msg.sender);
    }

    function caller_is_superAdmin(address caller) private view returns(bool) {
        bool caller_is_super_admin = false;
        for(uint i = 0; i<super_admins.length; i += 1)
        {
            if(super_admins[i]==caller)
            {
                caller_is_super_admin = true;
            }
        }
        return caller_is_super_admin;
    }

    function constituency_is_registered(bytes32 constituency) private view returns(bool) {
        bool cir = false;
        for(uint i = 0; i<registered_constituencies.length; i += 1)
        {
            if(registered_constituencies[i] == constituency)
            {
                cir = true;
            }
        }
        return cir;
    }

    function votingCentre_is_registered(bytes32 constituency, bytes32 voting_centre) private view returns(bool) {
        bool vir = false;
        for(uint i = 0; i<constituency_to_votingCentres[constituency].length; i += 1)
        {
            if(constituency_to_votingCentres[constituency][i] == voting_centre)
            {
                vir = true;
            }
        }
        return vir;
    }

    function all_constituencies_registered() private view returns (bool) {
        return (registered_constituencies.length == total_constituencies);
    }

    function caller_is_constituencyAdmin(bytes32 constituency, address caller) private view returns (bool) {
        bool caller_is_cAdmin = false;
        for(uint i = 0; i<constituencies_to_admins[constituency].length; i += 1)
        {
            if(constituencies_to_admins[constituency][i]==caller)
            {
                caller_is_cAdmin = true;
            }
        }
        return caller_is_cAdmin;
    }

    function voter_is_registered(address voter) private view returns (bool) {
        bool voter_registered = false;
        for(uint i = 0; i<registered_constituencies.length; i += 1)
        {
            for(uint j = 0; j<constituency_to_voters[registered_constituencies[i]].length; j += 1)
            {
                if(constituency_to_voters[registered_constituencies[i]][j] == voter)
                {
                    voter_registered = true;
                    break;
                }
            }
        }
        return voter_registered;
    }

    function voter_is_registered_inConstituency(bytes32 constituency, address voter) private view returns (bool) {
        bool voter_registered = false;
        for(uint j = 0; j<constituency_to_voters[constituency].length; j += 1)
        {
            if(constituency_to_voters[constituency][j] == voter)
            {
                voter_registered = true;
                break;
            }
        }
        return voter_registered;
    }

    function candidate_is_registered(bytes32 constituency, address candidate) private view returns (bool) {
        bool candidate_registered = false;
        for(uint i = 0; i<constituency_to_candidates[constituency].length; i += 1)
        {
            if(constituency_to_candidates[constituency][i] == candidate)
            {
                candidate_registered = true;
                break;
            }
        }
        return candidate_registered;
    }

    function is_election_day(bytes32 constituency) private view returns (bool) {
        require(constituency_to_electionDateTime[constituency].length == 2, 'Election date not set for constituency.');
        uint256 current_time = now;
        bool is_electionDay = (current_time >= constituency_to_electionDateTime[constituency][0] && current_time <= constituency_to_electionDateTime[constituency][1]);
        return is_electionDay;
    }

    function is_voteCount_day(bytes32 constituency) private view returns (bool) {
        require(constituency_to_voteCountDateTime[constituency].length == 2, 'Vote counting date not set for constituency.');
        uint256 current_time = now;
        bool is_voteCountDay = (current_time >= constituency_to_voteCountDateTime[constituency][0] && current_time <= constituency_to_voteCountDateTime[constituency][1]);
        return is_voteCountDay;
    }

    function is_resultDeclaration_day(bytes32 constituency) private view returns (bool) {
        require(constituency_to_resultDeclareCountDateTime[constituency].length == 2, 'Result declaration date not set for constituency.');
        uint256 current_time = now;
        bool is_resultDeclarationDay = (current_time >= constituency_to_resultDeclareCountDateTime[constituency][0] && current_time <= constituency_to_resultDeclareCountDateTime[constituency][1]);
        return is_resultDeclarationDay;
    }

    function get_superAdmins() public view returns (address[] memory){
        require(caller_is_superAdmin(msg.sender),'Only super admins can get list of other super admins.');
        return super_admins;
    }

    function add_superAdmin(address admin) public {
        require(caller_is_superAdmin(msg.sender), 'Only super admins can add other super admins!');
        super_admins.push(admin);
    }

    function register_constituency(string memory const_name) public {
        require(!all_constituencies_registered(),'All constituencies registered');
        require(caller_is_superAdmin(msg.sender),'Only super admins can register constituency!');
        bytes32 const_hash = keccak256(abi.encodePacked(const_name));
        registered_constituencies.push(const_hash);
    }

    function get_registered_constituencies_hash() public view returns(bytes32[] memory) {
        return registered_constituencies;
    }

    function add_constituencyAdmin(bytes32 constituency, address cAdmin) public {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require(caller_is_superAdmin(msg.sender),'Only super admins can add constituency admins!');
        constituencies_to_admins[constituency].push(cAdmin);
    }

    function get_constituency_admins(bytes32 constituency) public view returns (address[] memory) {
        require(caller_is_superAdmin(msg.sender),'Only super admins can get list of other super admins.');
        require(constituency_is_registered(constituency),'Constituency not registered!');
        return constituencies_to_admins[constituency];
    }

    function register_votingCentre(bytes32 constituency, string memory vc_name) public {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register voting centre!');
        bytes32 vc_hash = keccak256(abi.encodePacked(vc_name));
        constituency_to_votingCentres[constituency].push(vc_hash);
    }

    function get_registered_votingCentres_hash(bytes32 constituency) public view returns(bytes32[] memory) {
        return constituency_to_votingCentres[constituency];
    }

    function register_voter(bytes32 constituency, address voter) public {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register a voter!');
        constituency_to_voters[constituency].push(voter);
        voter_to_votingStatus[voter] = false;
    }

    function get_registered_voters(bytes32 constituency) public view returns (address[] memory) {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register a voter!');
        return constituency_to_voters[constituency];
    }

    function allocate_voter(bytes32 constituency, bytes32 voting_centre, address voter) public {
        require(votingCentre_is_registered(constituency, voting_centre),'Voting centre not registered');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register a voter!');
        require(voter_is_registered_inConstituency(constituency, voter),'Voter should be registered to allocate voter to voting centre');
        votingCentre_to_voters[voting_centre].push(voter);
    }

    function get_allocated_voters(bytes32 constituency, bytes32 voting_centre) public view returns (address[] memory) {
        require(votingCentre_is_registered(constituency, voting_centre),'Voting centre not registered');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register a voter!');
        return votingCentre_to_voters[voting_centre];
    }

    function register_candidate(bytes32 constituency, address candidate) public {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register a candidate!');
        require(voter_is_registered(candidate),'Candidate should be registered as a voter to be registered as candidate!');
        constituency_to_candidates[constituency].push(candidate);
    }

    function get_candidates(bytes32 constituency) public view returns (address[] memory) {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register a candidate!');
        return constituency_to_candidates[constituency];
    }

    function set_electionDate(bytes32 constituency, uint256 start_dateTime, uint256 end_dateTime) public {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register a candidate!');
        constituency_to_electionDateTime[constituency].push(start_dateTime);
        constituency_to_electionDateTime[constituency].push(end_dateTime);
    }

    function set_voteCountDate(bytes32 constituency, uint256 start_dateTime, uint256 end_dateTime) public {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register a candidate!');
        constituency_to_voteCountDateTime[constituency].push(start_dateTime);
        constituency_to_voteCountDateTime[constituency].push(end_dateTime);
    }

    function set_resultDeclareDate(bytes32 constituency, uint256 start_dateTime, uint256 end_dateTime) public {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can register a candidate!');
        constituency_to_resultDeclareCountDateTime[constituency].push(start_dateTime);
        constituency_to_resultDeclareCountDateTime[constituency].push(end_dateTime);
    }

    function vote(bytes32 constituency, bytes32 voting_centre, address candidate) public {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require(votingCentre_is_registered(constituency, voting_centre),'Voting centre not registered');
        require(voter_is_registered_inConstituency(constituency, msg.sender),'Voter should be registered to vote!');
        require(candidate_is_registered(constituency, candidate),'Candidate should be registered in that constituency!');
        require(is_election_day(constituency),'Voting can be done only on set election date.');
        require(!voter_to_votingStatus[msg.sender],'Voter has only one vote and it has been cast.');
        vote_count[candidate] += 1;
        voter_to_votingStatus[msg.sender] = true;
    }

    function get_voterStatus(bytes32 constituency, address voter) public view returns (bool) {
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can count votes!');
        require(voter_is_registered_inConstituency(constituency, msg.sender),'Voter should be registered to vote!');
        return voter_to_votingStatus[voter];
    }

    function get_totalVotes_votingCentre(bytes32 constituency, bytes32 voting_centre) public view returns (uint) {
        require(votingCentre_is_registered(constituency, voting_centre),'Voting centre not registered');
        require(is_voteCount_day(constituency),'Votes can be counted only on set vote counting day.');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can count votes!');
        uint count = 0;
        for(uint i = 0; i < votingCentre_to_voters[voting_centre].length; i += 1)
        {
            if(voter_to_votingStatus[votingCentre_to_voters[voting_centre][i]])
            {
                count += 1;
            }
        }
        return count;
    }

    function get_totalVotes_constituency(bytes32 constituency) public view returns (uint) {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require(is_voteCount_day(constituency),'Votes can be counted only on set vote counting day.');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can count votes!');
        uint count = 0;
        for(uint i = 0; i < constituency_to_candidates[constituency].length; i += 1)
        {
            count += vote_count[constituency_to_candidates[constituency][i]];
        }
        return count;
    }

    function get_totalVotes_candidate(bytes32 constituency, address candidate) public view returns (uint) {
        require(candidate_is_registered(constituency, candidate),'Candidate should be registered in that constituency!');
        require(is_voteCount_day(constituency),'Votes can be counted only on set vote counting day.');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can count votes!');
        return vote_count[candidate];
    }

    function compute_constituency_winner(bytes32 constituency) public {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require(is_resultDeclaration_day(constituency),'Results can be viewed only on result declaration day.');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can count votes!');
        uint current_winner_count = 0;
        for(uint i = 0; i < constituency_to_candidates[constituency].length; i += 1)
        {
            if(vote_count[constituency_to_candidates[constituency][i]] > current_winner_count)
            {
                delete winning_candidates;
                winning_candidates.push(constituency_to_candidates[constituency][i]);
                current_winner_count = vote_count[constituency_to_candidates[constituency][i]];
            }
            else if(vote_count[constituency_to_candidates[constituency][i]] == current_winner_count)
            {
                winning_candidates.push(constituency_to_candidates[constituency][i]);
            }
        }
    }

    function get_constituency_winners(bytes32 constituency) public view returns(address[] memory) {
        require(constituency_is_registered(constituency),'Constituency not registered!');
        require(is_resultDeclaration_day(constituency),'Results can be viewed only on result declaration day.');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(constituency, msg.sender)),'Only super admins or constituency admins can count votes!');
        return winning_candidates;
    }
}