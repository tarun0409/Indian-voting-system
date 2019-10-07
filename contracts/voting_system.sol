pragma solidity >=0.4.22 <0.6.0;

contract Voting_System
{
    address[] private super_admins;
    mapping (uint => address[]) private constituencies_to_admins; //done
    mapping (address => uint) private vote_count;
    uint private total_admissible_voters;
    uint private total_votes_cast;
    uint private total_constituencies;
    uint private registered_constituencies;
    uint private registered_voting_centres;
    mapping (uint => address[]) private constituency_to_voters; //done
    mapping (uint => uint) private votingCentre_to_constituency; //done
    mapping (uint => address[]) private votingCentre_to_voters; //done
    mapping (uint => address[]) private constituency_to_candidates; //done
    mapping (uint => uint256[]) private constituency_to_electionDateTime; //done
    mapping (uint => uint256[]) private constituency_to_voteCountDateTime; //done
    mapping (uint => uint256[]) private constituency_to_resultDeclareCountDateTime; //done
    mapping (address => bool) private voter_to_votingStatus; //done
    address[] private winning_candidates;

    constructor (uint total_consts) public {
        total_constituencies = total_consts;
        total_admissible_voters = 0;
        total_votes_cast = 0;
        registered_voting_centres = 0;
        registered_constituencies = 0;
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
        if(!caller_is_super_admin)
        {
            return false;
        }
        return true;
    }

    function caller_is_constituencyAdmin(address caller, uint constituency) private view returns (bool) {
        bool caller_is_cAdmin = false;
        for(uint i = 0; i<constituencies_to_admins[constituency].length; i += 1)
        {
            if(constituencies_to_admins[constituency][i]==caller)
            {
                caller_is_cAdmin = true;
            }
        }
        if(!caller_is_cAdmin)
        {
            return false;
        }
        return true;
    }

    function voter_is_registered(address voter, uint constituency) private view returns (bool) {
        bool voter_registered = false;
        for(uint i = 0; i<constituency_to_voters[constituency].length; i += 1)
        {
            if(constituency_to_voters[constituency][i] == voter)
            {
                voter_registered = true;
                break;
            }
        }
        if(!voter_registered)
        {
            return false;
        }
        return true;
    }

    function candidate_is_registered(address candidate, uint constituency) private view returns (bool) {
        bool candidate_registered = false;
        for(uint i = 0; i<constituency_to_candidates[constituency].length; i += 1)
        {
            if(constituency_to_candidates[constituency][i] == candidate)
            {
                candidate_registered = true;
                break;
            }
        }
        if(!candidate_registered)
        {
            return false;
        }
        return true;
    }

    function is_election_day(uint constituency) private view returns (bool) {
        require(constituency_to_electionDateTime[constituency].length == 2, 'Election date not set for constituency.');
        uint256 current_time = now;
        bool is_electionDay = (current_time >= constituency_to_electionDateTime[constituency][0] && current_time <= constituency_to_electionDateTime[constituency][1]);
        return is_electionDay;
    }

    function is_voteCount_day(uint constituency) private view returns (bool) {
        require(constituency_to_voteCountDateTime[constituency].length == 2, 'Vote counting date not set for constituency.');
        uint256 current_time = now;
        bool is_voteCountDay = (current_time >= constituency_to_voteCountDateTime[constituency][0] && current_time <= constituency_to_voteCountDateTime[constituency][1]);
        return is_voteCountDay;
    }

    function is_resultDeclaration_day(uint constituency) private view returns (bool) {
        require(constituency_to_resultDeclareCountDateTime[constituency].length == 2, 'Result declaration date not set for constituency.');
        uint256 current_time = now;
        bool is_resultDeclarationDay = (current_time >= constituency_to_resultDeclareCountDateTime[constituency][0] && current_time <= constituency_to_resultDeclareCountDateTime[constituency][1]);
        return is_resultDeclarationDay;
    }

    function add_superAdmin(address admin) public {
        require(caller_is_superAdmin(msg.sender), 'Only super admins can add other super admins!');
        super_admins.push(admin);
    }

    function add_constituencyAdmin(address cAdmin, uint constituency) public {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require(caller_is_superAdmin(msg.sender),'Only super admins can add constituency admins!');
        bool caller_is_super_admin = false;
        for(uint i = 0; i<super_admins.length; i += 1)
        {
            if(super_admins[i]==msg.sender)
            {
                caller_is_super_admin = true;
            }
        }
        if(!caller_is_super_admin)
        {
            revert('Only super admins can add constituency admins!');
        }
        constituencies_to_admins[constituency].push(cAdmin);
    }

    function register_constituency() public returns (uint){
        require(registered_constituencies < total_constituencies,'All constituencies registered!');
        require(caller_is_superAdmin(msg.sender),'Only super admins can register constituency!');
        uint ret_value = registered_constituencies;
        registered_constituencies += 1;
        return ret_value;
    }

    function register_votingCentre(uint constituency) public returns (uint) {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can register voting centre!');
        uint ret_value = registered_voting_centres;
        registered_voting_centres += 1;
        votingCentre_to_constituency[ret_value] = constituency;
        return ret_value;
    }

    function register_voter(address voter, uint constituency) public {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can register a voter!');
        constituency_to_voters[constituency].push(voter);
        voter_to_votingStatus[voter] = false;
    }

    function allocate_voter(address voter, uint voting_centre) public {
        require(voting_centre < registered_voting_centres, 'Voting centre not registered');
        uint constituency = votingCentre_to_constituency[voting_centre];
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can register a voter!');
        require(voter_is_registered(voter,constituency),'Voter should be registered to allocate voter to voting centre');
        votingCentre_to_voters[voting_centre].push(voter);
    }

    function register_candidate(address candidate, uint constituency) public {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can register a candidate!');
        require(voter_is_registered(candidate,constituency),'Candidate should be registered as a voter to be registered as candidate!');
        constituency_to_candidates[constituency].push(candidate);
    }

    function set_electionDate(uint constituency, uint256 start_dateTime, uint256 end_dateTime) public {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can register a candidate!');
        constituency_to_electionDateTime[constituency].push(start_dateTime);
        constituency_to_electionDateTime[constituency].push(end_dateTime);
    }

    function set_voteCountDate(uint constituency, uint256 start_dateTime, uint256 end_dateTime) public {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can register a candidate!');
        constituency_to_voteCountDateTime[constituency].push(start_dateTime);
        constituency_to_voteCountDateTime[constituency].push(end_dateTime);
    }

    function set_resultDeclareDate(uint constituency, uint256 start_dateTime, uint256 end_dateTime) public {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can register a candidate!');
        constituency_to_resultDeclareCountDateTime[constituency].push(start_dateTime);
        constituency_to_resultDeclareCountDateTime[constituency].push(end_dateTime);
    }

    function get_allCandidates_constituency(uint constituency) public view returns (address[] memory) {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can register a candidate!');
        return constituency_to_candidates[constituency];
    }

    function vote(uint constituency, uint voting_centre, address candidate) public {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require(voting_centre < registered_voting_centres, 'Voting centre not registered!');
        require(voter_is_registered(msg.sender,constituency),'Voter should be registered to vote!');
        require(candidate_is_registered(candidate,constituency),'Candidate should be registered in that constituency!');
        require(constituency_to_electionDateTime[constituency].length == 2,'Election day not set for constituency!');
        require(is_election_day(constituency),'Voting can be done only on set election date.');
        require(!voter_to_votingStatus[msg.sender],'Voter has only one vote and it has been cast.');
        vote_count[candidate] += 1;
    }

    function get_totalVotes_votingCentre(uint voting_centre) public view returns (uint) {
        require(voting_centre < registered_voting_centres, 'Voting centre not registered');
        uint constituency = votingCentre_to_constituency[voting_centre];
        require(is_voteCount_day(constituency),'Votes can be counted only on set vote counting day.');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can count votes!');
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

    function get_totalVotes_constituency(uint constituency) public view returns (uint) {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require(is_voteCount_day(constituency),'Votes can be counted only on set vote counting day.');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can count votes!');
        uint count = 0;
        for(uint i = 0; i < constituency_to_candidates[constituency].length; i += 1)
        {
            count += vote_count[constituency_to_candidates[constituency][i]];
        }
        return count;
    }

    function get_totalVotes_candidate(address candidate, uint constituency) public view returns (uint) {
        require(candidate_is_registered(candidate,constituency),'Candidate should be registered in that constituency!');
        require(is_voteCount_day(constituency),'Votes can be counted only on set vote counting day.');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can count votes!');
        return vote_count[candidate];
    }

    function get_constituency_winner(uint constituency) public returns (address[] memory) {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        require(is_resultDeclaration_day(constituency),'Results can be viewed only on result declaration day.');
        require((caller_is_superAdmin(msg.sender) || caller_is_constituencyAdmin(msg.sender,constituency)),'Only super admins or constituency admins can count votes!');
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
        return winning_candidates;
    }
}