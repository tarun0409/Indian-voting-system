const express = require('express');
const router = express.Router();
ObjectId = require('mongodb').ObjectID;
Admin = require('../../models/Admin.model');
getSmartContract = require('../../utils/blockchain');

router.get('/', (req,res) => {
    Admin.find().then((docs) => {
        res.json({admins:docs});
    });
});

router.get('/:id', (req,res) => {
    adminObj = {};
    adminObj._id = ObjectId(req.params.id);
    Admin.find(adminObj).then((docs) => {
        res.json({elections:docs});
    });
});

router.post('/', (req,res) => {
    if(!req.body.admins)
    {
        return res.status(400).json({msg:"Invalid format.", input:req.body});
    }
    if(!req.query.electionId)
    {
        return res.status(400).json({msg:"Query field not included : electionId", input:req.query});
    }
    var electionQuery = {};
    electionQuery._id = ObjectId(req.query.electionId);
    electionContract = null;
    Election.find(electionQuery).then((docs) => {
        if(docs.length <= 0)
        {
            return res.status(400).json({msg:"Invalid election ID"});
        }
        electionContract = getSmartContract(docs[0].Port);
        var admins = Array();
        for(i=0; i<req.body.admins.length; i+=1)
        {
            if(!req.body.admins[i].Name)
            {
                return res.status(400).json({msg:"Field not included : Name", input:req.body});
            }
            if(!req.body.admins[i].Public_Key)
            {
                return res.status(400).json({msg:"Field not included : Public Key", input:req.body});
            }
            var admin = {};
            admin.Name = req.body.admins[i].Name;
            admin.Public_Key = req.body.admins[i].Public_Key;
            if(req.body.admins[i].Phone_Number)
            {
                admin.Phone_Number = req.body.admins[i].Phone_Number;
            }
            if(req.body.admins[i].Address)
            {
                admin.Address = req.body.admins[i].Address;
            }
            if(req.body.admins[i].Comments)
            {
                admin.Comments = req.body.admins[i].Comments;
            }
            var adminObj = new Admin(admin);
            admins.push(adminObj);
        }
        var adminQuery = {};
        if(req.query.from)
        {
            adminQuery._id = ObjectId(req.query.from);
        }
        // console.log(adminQuery);
        Admin.find(adminQuery).then((adminDocs) => {
            
            if(adminDocs.length > 0 && !req.query.from)
            {
                return res.status(400).json({msg:"Query to be included: from:{adminId}", query:req.query});
            }
            else if(adminDocs.length === 0 && req.query.from)
            {
                return res.status(400).json({msg:"Invalid Admin ID", query:req.query});
            }
            else if(adminDocs.length > 0 && req.query.from && String(adminDocs[0]._id) !== req.query.from)
            {
                return res.status(400).json({msg:"Invalid Admin ID", query:req.query});
            }
            var fromObj = {};
            if(adminDocs.length > 0)
            {
                fromObj.from = adminDocs[0].Public_Key;
            }
            else
            {
                fromObj.from = admins[0].Public_Key;
            }
            Admin.create(admins).then((data)=> {
                var responseObj = {};
                responseObj.msg = "Admin(s) inserted successfully";
                responseObj.input = data;
                elObj = {};
                elObj._id = req.query.electionId;
                electionContract.deployed().then((instance) => {
                    var adminPromise = null;
                    instance.addAdmin(data[0].Public_Key,fromObj).then(function () {
                        return res.status(201).json(responseObj);
                    }).catch((err) => {
                        console.log(err);
                        return res.status(500).json({msg:"Internal Server Error"}); 
                    });
                });
            }).catch((err)=>{
                console.log(err);
                return res.status(500).json({msg:"Internal Server Error"}); 
            });
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Internal Server Error"});
    });
});

router.put('/:id', (req,res) => {
    queryObj = {};
    queryObj._id = ObjectId(req.params.id);
    Admin.updateOne(queryObj,req.body, (err) => {
        if(err)
        {
            return res.status(500).json({msg:"Internal Server Error"});
        }
        return res.status(200).json({"message":"Updated successfully"});
    });
});

router.delete('/:id', (req,res) => {
    adminObj = {};
    adminObj._id = ObjectId(req.params.id);
    Admin.remove(adminObj).then((data) => {
        var responseObj = {};
        responseObj.msg = "Admin deleted successfully";
        responseObj.details = data;
        return res.status(200).json(responseObj);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Internal Server Error"});
    });
});

module.exports = router;