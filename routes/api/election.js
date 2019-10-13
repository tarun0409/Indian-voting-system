const express = require('express');
const router = express.Router();
mongoose = require('mongoose');
Election = require('../../models/Election.model');

router.get('/', (req,res) => {
    Election.find().then((docs) => {
        res.json({elections:docs});
    });
});

router.post('/', (req,res) => {
    if(!req.body.elections)
    {
        return res.status(400).json({msg:"Invalid format.", input:req.body});
    }
    var elections = Array();
    for(i=0; i<req.body.elections.length; i+=1)
    {
        if(!req.body.elections[i].Name)
        {
            return res.status(400).json({msg:"Field not included : Name", input:req.body});
        }
        var election = {};
        election.Name = req.body.elections[i].Name;
        var electionObj = new Election(election);
        elections.push(electionObj);
    }
    Election.create(elections).then((data)=> {
        var responseObj = {};
        responseObj.msg = "Election inserted successfully";
        responseObj.input = data;
        res.status(201).json(responseObj);
    }).catch((err)=>{
        console.log(err);
        return res.status(500).json({msg:"Internal Server Error"}); 
    });
});

router.delete('/:id', (req,res) => {
    electionObj = {};
    electionObj._id = ObjectId(req.params.id);
    Election.remove(electionObj).then((data) => {
        var responseObj = {};
        responseObj.msg = "Election(s) deleted successfully";
        responseObj.details = data;
        res.status(200).json(responseObj);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Internal Server Error"});
    });
});

module.exports = router;