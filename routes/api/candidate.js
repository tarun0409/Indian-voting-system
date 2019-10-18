const express = require('express');
const router = express.Router();
ObjectId = require('mongodb').ObjectID;
Election = require('../../models/Election.model');
Admin = require('../../models/Admin.model');
Candidate = require('../../models/Candidate.model');
BlockchainApp = require('../../utils/blockchain');

router.get('/', (req,res) => {
    if(!req.query.electionId)
    {
        return res.status(400).json({msg:"Query field not included : electionId", input:req.query});
    }
    var electionQuery = {};
    electionQuery._id = ObjectId(req.query.electionId);
    Election.find(electionQuery).then((elections) => {
        if(elections.length === 0)
        {
            return res.status(400).json({msg:"Invalid election ID", input:req.query});
        }
        candidateQuery = {};
        candidateQuery.Election_ID = ObjectId(req.query.electionId);
        Candidate.find(candidateQuery).then((candidatesFetched) => {
            if(candidatesFetched.length === 0)
            {
                return res.status(204).json({candidates:[]});
            }
            res.json({candidates:candidatesFetched});
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with fetching candidates from database"});
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching elections from database"});
    });
});

router.get('/:id', (req,res) => {
    if(!req.query.electionId)
    {
        return res.status(400).json({msg:"Query field not included : electionId", input:req.query});
    }
    var electionQuery = {};
    electionQuery._id = ObjectId(req.query.electionId);
    Election.find(electionQuery).then((elections) => {
        if(elections.length === 0)
        {
            return res.status(400).json({msg:"Invalid election ID", input:req.query});
        }
        candidateQuery = {};
        candidateQuery._id = ObjectId(req.params.id);
        Candidate.find(candidateQuery).then((candidatesFetched) => {
            if(candidatesFetched.length === 0)
            {
                return res.status(204).json({candidates:[]});
            }
            res.json({candidates:candidatesFetched});
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with fetching candidates from database"});
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching elections from database"});
    });
});

router.post('/register', (req,res) => {
    
    if(!req.body.candidates)
    {
        return res.status(400).json({msg:"Invalid format.", input:req.body});
    }
    if(!req.query.from)
    {
        return res.status(400).json({msg:"Fields to be included : from", query:req.query});
    }
    if(!req.query.electionId)
    {
        return res.status(400).json({msg:"Fields to be included : electionId", query:req.query});
    }
    var electionQuery = {};
    electionQuery._id = ObjectId(req.query.electionId);
    Election.find(electionQuery).then((elections) => {
        if(elections.length <= 0)
        {
            return res.status(400).json({msg:"Invalid election ID", query:req.query});
        }
        BlockchainApp.initBlockchainServer(elections[0].Port);
        BlockchainApp.web3.eth.getAccounts((err,accounts) => {
            if(err)
            {
                console.log(err);
                return res.status(500).json({msg:"Problem occurred while trying to get accounts from contract"});
            }
            candidates = Array();
            candidatePubKeys = Array();
            for(i=0; i<req.body.candidates.length; i+=1)
            {
                if(!req.body.candidates[i].Name)
                {
                    return res.status(400).json({msg:"Field not included : Name", input:req.body});
                }
                if(!req.body.candidates[i].Public_Key)
                {
                    return res.status(400).json({msg:"Field not included : Public Key", input:req.body});
                }
                if(!accounts.includes(req.body.candidates[i].Public_Key))
                {
                    return res.status(400).json({msg:"Invalid Public key given"});
                }
                candidatePubKeys.push(req.body.candidates[i].Public_Key);
                var candidate = {};
                candidate.Name = req.body.candidates[i].Name;
                candidate.Public_Key = req.body.candidates[i].Public_Key;
                candidate.Election_ID = req.query.electionId;
                if(req.body.candidates[i].Party)
                {
                    candidate.Voting_Location = req.body.candidates[i].Voting_Location;
                }
                if(req.body.candidates[i].Proposal)
                {
                    candidate.Comments = req.body.candidates[i].Comments;
                }
                var candidateObj = new Candidate(candidate);
                candidates.push(candidateObj);
            }
            var adminQuery = {};
            adminQuery._id = ObjectId(req.query.from);
            Admin.find(adminQuery).then((admins) => {
                if(admins.length <= 0)
                {
                    return res.status(400).json({msg:"Invalid from Admin ID", query:req.query});
                }
                var fromObj = {};
                fromObj.from = admins[0].Public_Key;
                var electionContract = BlockchainApp.getSmartContract();
                electionContract.deployed().then((instance) => {
                    instance.registerCandidate(candidatePubKeys[0],fromObj).then(() => {
                        Candidate.create(candidates).then((createdCandidates) => {
                            var successResponseObj = {};
                            successResponseObj.msg = "Candidate(s) inserted successfully";
                            successResponseObj.data = createdCandidates;
                            return res.status(201).json(successResponseObj);
                        }).catch((err) => {
                            console.log(err);
                            return res.status(500).json({msg:"Problem occurred while registering candidate in database"});
                        });
                    }).catch((err) => {
                        console.log(err);
                        return res.status(500).json({msg:"Problem occurred while registering candidate in blockchain"});
                    });
                }).catch((err) => {
                    console.log(err);
                    return res.status(500).json({msg:"Problem occurred while trying to deploy contract"});
                });
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({msg:"Problem occurred while fetching admins from database"});
            });
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem occurred while fetching elections from database"});
    });
});

router.put('/:id', (req,res) => {
    if(!req.query.electionId)
    {
        return res.status(400).json({msg:"Fields to be included: electionId"});
    }
    electionQuery = {};
    electionQuery._id = ObjectId(req.query.electionId);
    Election.find(electionQuery).then((elections) => {
        if(elections.length <= 0)
        {
            return res.status(400).json({msg:"Invalid electionId"});
        }
        queryObj = {};
        queryObj._id = ObjectId(req.params.id);
        if(req.body.Public_Key)
        {
            return res.status(400).json({msg:"Public Key of Candidate cannot be changed. You may try to delete the candidate and insert again"});
        }
        if(req.body.Election_ID)
        {
            return res.status(400).json({msg:"Election ID of candidate cannot be changed"});
        }
        if(req.body.Total_Votes)
        {
            return res.status(400).json({msg:"Cannot update Total Votes field with this API."});
        }
        Candidate.updateOne(queryObj,req.body, (err) => {
            if(err)
            {
                return res.status(500).json({msg:"Some problem occurred while updating admin(s)"});
            }
            return res.status(200).json({msg:"Candidate updated successfully", data:req.body});
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Some problem occurred while fetching elections from database"}); 
    });
});

router.delete('/:id', (req,res) => {
    if(!req.query.electionId)
    {
        return res.status(400).json({msg:"Query field not included : electionId", input:req.query});
    }
    if(!req.query.from)
    {
        return res.status(400).json({msg:"Query field not included : from", input:req.query});
    }
    electionQuery = {};
    electionQuery._id = ObjectId(req.query.electionId);
    Election.find(electionQuery).then((elections) => {
        if(elections.length === 0)
        {
            return res.status(400).json({msg:"Invalid election ID", input:req.query});
        }
        var adminQuery = {};
        adminQuery._id = ObjectId(req.query.from);
        Admin.find(adminQuery).then((admins) => {
            if(admins.length === 0)
            {
                return res.status(400).json({msg:"Invalid from admin ID", input:req.query});
            }
            fromObj = {};
            fromObj.from = admins[0].Public_Key;
            var candidateQuery = {};
            candidateQuery._id = ObjectId(req.params.id);
            Candidate.find(candidateQuery).then((candidates) => {
                if(candidates.length === 0)
                {
                    return res.status(400).json({msg:"Invalid candidate ID", input:req.query});
                }
                var delCandidatePubKey = candidates[0].Public_Key;
                var delCandidateObj = {};
                delCandidateObj._id = ObjectId(req.params.id);
                BlockchainApp.initBlockchainServer(elections[0].Port);
                var electionContract = BlockchainApp.getSmartContract();
                electionContract.deployed().then((instance) => {
                    instance.removeCandidate(delCandidatePubKey, fromObj).then(() => {
                        Candidate.deleteOne(delCandidateObj, (err) => {
                            if(err)
                            {
                                console.log(err);
                                return res.status(500).json({msg:"Some problem occurred while removing candidate from database"});
                            }
                            return res.status(200).json({msg:"Candidate deleted successfully"});
                        });
                    }).catch((err) => {
                        console.log(err);
                        return res.status(500).json({msg:"Some problem occurred while removing candidate from blockchain"});
                    });
                }).catch((err) => {
                    console.log(err);
                    return res.status(500).json({msg:"Some problem occurred while deploying smart contract"});
                });

            }).catch((err) => {
                console.log(err);
                return res.status(500).json({msg:"Some problem occurred while fetching candidates from database"});
            });
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Some problem occurred while fetching admins from database"});
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Some problem occurred while fetching elections from database"});
    });
});

module.exports = router;