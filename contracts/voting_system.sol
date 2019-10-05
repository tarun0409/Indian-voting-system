pragma solidity >=0.4.22 <0.6.0;

contract Voting_System
{
    address[] private voters;
    //mapping (address => string) private voter_to_voterId;
    address[] private candidates;
    //mapping (address => string) private candidate_to_voterId;
    address[] private admins;
    mapping (uint => address[]) constituencies_to_admins;
    mapping (uint => address[]) votingCentre_to_admins;
    mapping (address => uint) private vote_count;
    uint total_admissible_voters;
    uint total_votes_cast;
    uint total_constituencies;
    uint registered_constituencies;
    uint registered_voting_centres;
    mapping (uint => address[]) constituency_to_voters; //done
    mapping (uint => uint) votingCentre_to_constituency; //done
    mapping (uint => address[]) votingCentre_to_voters; //done
    mapping (uint => address[]) constituency_to_candidates;

    constructor (uint total_consts) public {
        total_constituencies = total_consts;
        total_admissible_voters = 0;
        total_votes_cast = 0;
        registered_voting_centres = 0;
        registered_constituencies = 0;
        admins.push(msg.sender);
    }

    function add_admin(address admin) public {
        bool caller_is_admin = false;
        for(uint i = 0; i<admins.length; i += 1)
        {
            if(admins[i]==msg.sender)
            {
                caller_is_admin = true;
            }
        }
        if(!caller_is_admin)
        {
            revert('Only admins can add other admins!');
        }
        admins.push(admin);
    }

    function register_constituency() public returns (uint){
        require(registered_constituencies < total_constituencies,'All constituencies registered!');
        bool caller_is_admin = false;
        for(uint i = 0; i<admins.length; i += 1)
        {
            if(admins[i]==msg.sender)
            {
                caller_is_admin = true;
            }
        }
        if(!caller_is_admin)
        {
            revert('Only admins can register constituency!');
        }
        uint ret_value = registered_constituencies;
        registered_constituencies += 1;
        return ret_value;
    }

    function register_votingCentre(uint constituency) public returns (uint) {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        bool caller_is_admin = false;
        for(uint i = 0; i<admins.length; i += 1)
        {
            if(admins[i]==msg.sender)
            {
                caller_is_admin = true;
            }
        }
        if(!caller_is_admin)
        {
            revert('Only admins can register voting centres!');
        }
        uint ret_value = registered_voting_centres;
        registered_voting_centres += 1;
        votingCentre_to_constituency[ret_value] = constituency;
        return ret_value;
    }

    function register_voter(address voter, uint constituency) public {
        require(constituency < registered_constituencies, 'Constituency not registered!');
        bool caller_is_admin = false;
        for(uint i = 0; i<admins.length; i += 1)
        {
            if(admins[i]==msg.sender)
            {
                caller_is_admin = true;
            }
        }
        if(!caller_is_admin)
        {
            revert('Only admins can register voters!');
        }
        constituency_to_voters[constituency].push(voter);
    }

    function allocate_voter(address voter, uint voting_centre) public {
        require(voting_centre < registered_voting_centres, 'Voting centre not registered');
        bool caller_is_admin = false;
        for(uint i = 0; i<admins.length; i += 1)
        {
            if(admins[i]==msg.sender)
            {
                caller_is_admin = true;
            }
        }
        if(!caller_is_admin)
        {
            revert('Only admins can allocate voter to voting centres!');
        }
        uint constituency = votingCentre_to_constituency[voting_centre];
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
            revert('Voter has not been registered!');
        }
        votingCentre_to_voters[voting_centre].push(voter);
    }
}