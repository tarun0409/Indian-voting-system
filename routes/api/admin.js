const express = require('express');
const router = express.Router();
ObjectId = require('mongodb').ObjectID;
Admin = require('../../models/Admin.model');
BlockchainApp = require('../../utils/blockchain');

router.get('/', (req,res) => {
    if(!req.query.electionId)
    {
        return res.status(400).json({msg:"Query field not included : electionId", input:req.query});
    }
    var electionQuery = {};
    electionQuery._id = ObjectId(req.query.electionId);
    Election.find(electionQuery).then((elections) => {
        BlockchainApp.initBlockchainServer(elections[0].Port);
        var electionContract = BlockchainApp.getSmartContract();
        electionContract.deployed().then((instance) => {
            instance.getAdmins().then((admins) => {
                var adminQuery = {};
                adminQuery.Public_Key = {"$in":admins};
                Admin.find(adminQuery).then((adminsFetched) => {
                    res.json({admins:adminsFetched});
                }).catch((err) => {
                    console.log(err);
                    res.status(500).json({msg:"Problem with fetching admins from database"});
                });
            }).catch((err) => {
                console.log(err);
                res.status(500).json({msg:"Problem with fetching admins from blockchain"});
            });
        });
    }).catch((err) => {
        res.status(500).json({msg:"Problem with deploying contract"});
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
        BlockchainApp.initBlockchainServer(elections[0].Port);
        var electionContract = BlockchainApp.getSmartContract();
        electionContract.deployed().then((instance) => {
            instance.getAdmins().then((admins) => {
                var adminQuery = {};
                adminQuery._id = ObjectId(req.params.id);
                Admin.find(adminQuery).then((adminsFetched) => {
                    if(admins.includes(adminsFetched[0].Public_Key))
                    {
                        res.json({admins:adminsFetched});
                    }
                    else
                    {
                        res.status(204).json({admins:[]});
                    }
                }).catch((err) => {
                    res.status(500).json({msg:"Problem with fetching admins from database"});
                });
            }).catch((err) => {
                res.status(500).json({msg:"Problem with fetching admins from blockchain"});
            });
        });
    }).catch((err) => {
        res.status(500).json({msg:"Problem with deploying contract"});
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
        BlockchainApp.initBlockchainServer(docs[0].Port);
        var electionContract = BlockchainApp.getSmartContract();
        var admins = Array();
        BlockchainApp.web3.eth.getAccounts(function(err, accounts){
            if(err)
            {
                return res.status(500).json({msg:"Problem getting account list from blockchain server"}); 
            }
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
                if(!accounts.includes(req.body.admins[i].Public_Key))
                {
                    return res.status(400).json({msg:"Invalid Public key given"});
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
                    createdAdmin = {};
                    createdAdmin._id = ObjectId(data[0]._id);
                    electionContract.deployed().then((instance) => {
                        instance.addAdmin(data[0].Public_Key,fromObj).then(function () {
                            return res.status(201).json(responseObj);
                        }).catch((err) => {
                            console.log(err);
                            Admin.remove(createdAdmin).then((data) => {
                                return res.status(500).json({msg:"Some problem occurred when creating admins"});
                            }).catch((err) => {
                                console.log(err);
                            });
                            return res.status(500).json({msg:"Some problem occurred while adding admin to blockchain server"}); 
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