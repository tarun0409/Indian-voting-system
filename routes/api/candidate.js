const express = require('express');
const router = express.Router();
mongoose = require('mongoose');
Candidate = require('../../models/Candidate.model');

router.get('/', (req,res) => {
    Candidate.find().then((docs) => {
        res.json(docs);
    });
});

router.post('/register', (req,res) => {
    if(!req.body.candidates)
    {
        return res.status(400).json({msg:"Invalid format.", input:req.body});
    }
    var candidates = Array();
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
        if(!req.body.candidates[i].Status)
        {
            return res.status(400).json({msg:"Field not included : Public Key", input:req.body});
        }
        var candidate = {};
        candidate.Name = req.body.candidates[i].Name;
        candidate.Public_Key = req.body.candidates[i].Public_Key;
        candidate.Status = req.body.candidates[i].Status;
        candidate.Total_Votes = 0;
        if(req.body.candidates[i].Party)
        {
            candidate.Party = req.body.candidates[i].Party;
        }
        if(req.body.candidates[i].Proposal)
        {
            candidate.Proposal = req.body.candidates[i].Proposal;
        }
        var candidateObj = new Candidate(candidate);
        candidates.push(candidateObj);
    }
    Candidate.create(candidates).then((data)=> {
        var responseObj = {};
        responseObj.msg = "Candidate(s) inserted successfully";
        responseObj.input = data;
        res.status(201).json(responseObj);
    }).catch((err)=>{
        console.log(err);
        return res.status(500).json({msg:"Internal Server Error"}); 
    });
});

router.put('/:id', (req,res) => {
    queryObj = {};
    queryObj._id = ObjectId(req.params.id);
    Candidate.updateOne(queryObj,req.body, (err) => {
        if(err)
        {
            return res.status(500).json({msg:"Internal Server Error"});
        }
        return res.status(200).json({"message":"Updated successfully"});
    });
});

router.delete('/:id', (req,res) => {
    candidateObj = {};
    candidateObj._id = ObjectId(req.params.id);
    Candidate.remove(candidateObj).then((data) => {
        var responseObj = {};
        responseObj.msg = "Candidate deleted successfully";
        responseObj.details = data;
        res.status(200).json(responseObj);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Internal Server Error"});
    });
});

module.exports = router;