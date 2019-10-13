const express = require('express');
const router = express.Router();
mongoose = require('mongoose');
Voter = require('../../models/Voter.model');

router.get('/', (req,res) => {
    Voter.find().then((docs) => {
        res.json(docs);
    });
});

router.post('/register', (req,res) => {
    if(!req.body.voters)
    {
        return res.status(400).json({msg:"Invalid format.", input:req.body});
    }
    var voters = Array();
    for(i=0; i<req.body.voters.length; i+=1)
    {
        if(!req.body.voters[i].Name)
        {
            return res.status(400).json({msg:"Field not included : Name", input:req.body});
        }
        if(!req.body.voters[i].Public_Key)
        {
            return res.status(400).json({msg:"Field not included : Public Key", input:req.body});
        }
        if(!req.body.voters[i].Status)
        {
            return res.status(400).json({msg:"Field not included : Public Key", input:req.body});
        }
        var voter = {};
        voter.Name = req.body.voters[i].Name;
        voter.Public_Key = req.body.voters[i].Public_Key;
        if(req.body.voters[i].Voting_Location)
        {
            voter.Voting_Location = req.body.voters[i].Voting_Location;
        }
        if(req.body.voters[i].Status)
        {
            voter.Status = req.body.voters[i].Status;
        }
        if(req.body.voters[i].Comments)
        {
            voter.Comments = req.body.voters[i].Comments;
        }
        var voterObj = new Voter(voter);
        voters.push(voterObj);
    }
    Voter.create(voters).then((data)=> {
        var responseObj = {};
        responseObj.msg = "Voter(s) inserted successfully";
        responseObj.input = data;
        res.status(201).json(responseObj);
    }).catch((err)=>{
        console.log(err);
        return res.status(500).json({msg:"Internal Server Error"}); 
    });
});

module.exports = router;