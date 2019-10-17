const express = require('express');
const router = express.Router();
ObjectId = require('mongodb').ObjectID;
Election = require('../../models/Election.model');

router.get('/', (req,res) => {
    Election.find().then((docs) => {
        res.json({elections:docs});
    });
});

router.get('/:id', (req,res) => {
    electionObj = {};
    electionObj._id = ObjectId(req.params.id);
    Election.find(electionObj).then((docs) => {
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
        if(!req.body.elections[i].Port)
        {
            return res.status(400).json({msg:"Field not included : Port", input:req.body});
        }
        Election.find().then((docs) => {
            for(i=0; i<docs.length; i++)
            {
                if(docs[i].Port === req.body.elections[i].Port)
                {
                    return res.status(400).json({msg:"Blockchain server already in use by another election"});
                }
            }
        });
        var election = {};
        election.Name = req.body.elections[i].Name;
        election.Port = req.body.elections[i].Port;
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

router.put('/:id', (req,res) => {
    queryObj = {};
    queryObj._id = ObjectId(req.params.id);
    Election.updateOne(queryObj,req.body, () => {
        return res.status(200).json({"message":"Updated successfully"});
    });
});

router.delete('/:id', (req,res) => {
    electionObj = {};
    electionObj._id = ObjectId(req.params.id);
    Election.remove(electionObj).then((data) => {
        var responseObj = {};
        responseObj.msg = "Election deleted successfully";
        responseObj.details = data;
        res.status(200).json(responseObj);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Internal Server Error"});
    });
});

module.exports = router;