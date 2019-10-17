pragma solidity >=0.4.22 <0.6.0;

contract Voting_System
{
    address superAdmin;
    address[] private admins;
    address[] private voters;
    address[] private candidates;
    address[] private votedVoters;
    bytes32[] private voteHashes;
    uint256 private electionStartDateTime;
    uint256 private electionEndDateTime;
    uint256 private voteCountStartDateTime;
    uint256 private voteCountEndDateTime;
    mapping (address => uint) private candidateToVoteCount;

    constructor () public {
        superAdmin = address(0);
    }

    function addressIsSuperAdmin(address caller) private view returns(bool) {
        return (caller == superAdmin);
    }

    function addressIsAdmin(address caller) private view returns(bool) {
        bool caller_is_admin = false;
        for(uint i = 0; i<admins.length; i += 1)
        {
            if(admins[i]==caller)
            {
                caller_is_admin = true;
            }
        }
        return caller_is_admin;
    }

    function voterIsRegistered(address voter) private view returns (bool) {
        bool voterRegistered = false;
        for(uint i = 0; i<voters.length; i += 1)
        {
            if(voters[i] == voter)
            {
                voterRegistered = true;
            }
        }
        return voterRegistered;
    }

    function candidateIsRegistered(address candidate) private view returns (bool) {
        bool candidateRegistered = false;
        for(uint i = 0; i<candidates.length; i += 1)
        {
            if(candidates[i] == candidate)
            {
                candidateRegistered = true;
            }
        }
        return candidateRegistered;
    }

    function isElectionDay() private view returns (bool) {
        require(electionStartDateTime != 0 && electionEndDateTime != 0, 'Election date not set.');
        uint256 currentTime = now;
        return (currentTime >= electionStartDateTime && currentTime <= electionEndDateTime);
    }

    function isVoteCountDay() private view returns (bool) {
        require(voteCountStartDateTime != 0 && voteCountEndDateTime != 0, 'Vote counting date not set.');
        uint256 current_time = now;
        return (current_time >= voteCountStartDateTime && current_time <= voteCountEndDateTime);
    }

    function voterHasVoted(address voter) private view returns (bool) {
        bool voterVoted = false;
        for(uint i = 0; i<votedVoters.length; i += 1)
        {
            if(votedVoters[i] == voter)
            {
                voterVoted = true;
                break;
            }
        }
        return voterVoted;
    }

    function makeSuperAdmin(address addr) public
    {
        require(superAdmin == address(0) || addressIsSuperAdmin(msg.sender), 'The caller should be super admin');
        bool adminFound = false;
        for(uint i = 0; i<admins.length; i += 1)
        {
            if(admins[i] == superAdmin)
            {
                adminFound = true;
                break;
            }
        }
        if(!adminFound && superAdmin != address(0))
        {
            addAdmin(superAdmin);
        }
        superAdmin = addr;
    }

    function addAdmin(address admin) public {
        require(addressIsSuperAdmin(msg.sender), 'Only super admin can add admins.');
        if(!addressIsAdmin(admin))
        {
            admins.push(admin);
        }
    }

    function removeAdmin(address admin) public {
        require(addressIsSuperAdmin(msg.sender), 'Only super admin can remove other admins.');
        uint index = 0;
        for( ; index<admins.length; index += 1)
        {
            if(admins[index] == admin)
            {
                break;
            }
        }
        if(index < admins.length-1)
        {
            for(uint i = index; i < admins.length-1 ; i += 1)
            {
                admins[i] = admins[i+1];
            }
            delete admins[admins.length-1];
            admins.length--;
        }
    }

    function getAdmins() public view returns (address[] memory){
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender),'Only admins can get list of other admins.');
        return admins;
    }

    function registerVoter(address voter) public {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender), 'Only admins can register a voter!');
        voters.push(voter);
    }

    function removeVoter(address voter) public {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender), 'Only super admin can remove other admins.');
        uint index = 0;
        for( ; index<voters.length; index += 1)
        {
            if(voters[index] == voter)
            {
                break;
            }
        }
        if(index < voters.length-1)
        {
            for(uint i = index; i < voters.length-1 ; i += 1)
            {
                voters[i] = voters[i+1];
            }
            delete voters[voters.length-1];
            voters.length--;
        }
    }

    function getRegisteredVoters() public view returns (address[] memory) {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender), 'Only admins can register a voter!');
        return voters;
    }

    function registerCandidate(address candidate) public {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender), 'Only admins can register a candidate.');
        require(voterIsRegistered(candidate),'Candidate should be registered as a voter to be registered as candidate!');
        candidates.push(candidate);
    }

    function removeCandidate(address candidate) public {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender), 'Only super admin can remove other admins.');
        uint index = 0;
        for( ; index<candidates.length; index += 1)
        {
            if(candidates[index] == candidate)
            {
                break;
            }
        }
        if(index < candidates.length-1)
        {
            for(uint i = index; i < candidates.length-1 ; i += 1)
            {
                candidates[i] = candidates[i+1];
            }
            delete candidates[candidates.length-1];
            candidates.length--;
        }
    }

    function getRegisteredCandidates() public view returns (address[] memory) {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender), 'Only admins can register a candidate.');
        return candidates;
    }

    function setElectionDate(uint256 startDateTime, uint256 endDateTime) public {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender), 'Only admins can set an election date.');
        electionStartDateTime = startDateTime;
        electionEndDateTime = endDateTime;
    }

    function setVoteCountDate(uint256 startDateTime, uint256 endDateTime) public {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender), 'Only admins can set vote count date.');
        voteCountStartDateTime = startDateTime;
        voteCountEndDateTime = endDateTime;
    }

    function vote(bytes32 choiceHash) public {
        require(voterIsRegistered(msg.sender), 'Voter should be registered to vote.');
        require(isElectionDay(),'Voting can be done only on set election date.');
        require(!voterHasVoted(msg.sender), 'Voter has only one vote and it has been cast.');
        voteHashes.push(choiceHash);
        votedVoters.push(msg.sender);
    }

    function getTotalVotesCast() public view returns (uint) {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender),'Only admins can see vote choices.');
        return voteHashes.length;

    }

    function getTotalVotesCandidate(address candidate, bytes32[] memory nonces) public view returns (uint) {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender),'Only admins can see vote choices.');
        require(candidateIsRegistered(candidate),'Candidate should be registered.');
        require(isVoteCountDay(),'Votes can be counted only on set vote counting day.');
        uint totalVotes = 0;
        for(uint i = 0; i<nonces.length; i += 1)
        {
            bytes32 candidateHash = keccak256(abi.encodePacked(candidate, nonces[i]));
            for(uint j = 0; j<voteHashes.length; j += 1)
            {
                if(voteHashes[j] == candidateHash)
                {
                    totalVotes += 1;
                }
            }
        }
        return totalVotes;
    }

    function countAllVotes(bytes32[] memory nonces) public {
        require(addressIsAdmin(msg.sender) || addressIsSuperAdmin(msg.sender),'Only admins can see vote choices.');
        require(isVoteCountDay(),'Votes can be counted only on set vote counting day.');
        for(uint i = 0; i<nonces.length; i += 1)
        {
            for(uint j = 0; j<candidates.length; j += 1)
            {
                bytes32 candidateHash = keccak256(abi.encodePacked(candidates[j], nonces[i]));
                for(uint k = 0; k<voteHashes.length; k += 1)
                {
                    if(voteHashes[k] == candidateHash)
                    {
                        candidateToVoteCount[candidates[j]] += 1;
                    }
                }
            }
        }
    }
}