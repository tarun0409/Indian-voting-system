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
        if(elections.length === 0)
        {
            return res.status(400).json({msg:"Invalid election ID", input:req.query});
        }
        adminQuery = {};
        adminQuery.Election_ID = ObjectId(req.query.electionId);
        Admin.find(adminQuery).then((adminsFetched) => {
            if(adminsFetched.length === 0)
            {
                return res.status(204).json({admins:[]});
            }
            res.json({admins:adminsFetched});
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with fetching admins from database"});
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
        adminQuery = {};
        adminQuery._id = ObjectId(req.params.id);
        Admin.find(adminQuery).then((adminsFetched) => {
            if(adminsFetched.length === 0)
            {
                return res.status(204).json({admins:[]});
            }
            res.json({admins:adminsFetched});
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem with fetching admins from database"});
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem with fetching elections from database"});
    });
});

router.post('/', (req,res) => {
    if(!req.body.admins)
    {
        return res.status(400).json({msg:"Invalid format.", input:req.body});
    }
    if(!req.query.electionId)
    {
        return res.status(400).json({msg:"Fields not included: electionId", query:req.query});
    }
    var electionQuery = {};
    electionQuery._id = ObjectId(req.query.electionId);
    Election.find(electionQuery).then((elections) => {
        if(elections.length <= 0)
        {
            return res.status(400).json({msg:"Invalid electionId", input:req.body});
        }
        BlockchainApp.initBlockchainServer(elections[0].Port);
        BlockchainApp.web3.eth.getAccounts((err, accounts) => {
            if(err)
            {
                console.log(err);
                return res.status(500).json({msg:"Problem with fetching accounts from web3", input:req.body}); 
            }
            admins = Array();
            adminPubKeys = Array();
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
                adminPubKeys.push(req.body.admins[i].Public_Key);
                var admin = {};
                admin.Name = req.body.admins[i].Name;
                admin.Public_Key = req.body.admins[i].Public_Key;
                admin.Election_ID = req.query.electionId;
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
            Admin.find().then((allAdmins) => {
                var electionContract = BlockchainApp.getSmartContract();
                var successResponseObj = {};
                successResponseObj.msg = "Admins(s) inserted successfully";
                fromObj = {};
                if(allAdmins.length === 0)
                {
                    admins[0].Is_Super_Admin = true;
                    electionContract.deployed().then((instance) => {
                        fromObj.from = adminPubKeys[0];
                        instance.makeSuperAdmin(adminPubKeys[0], fromObj).then(() => {
                            Admin.create(admins).then((createdAdmins) => {
                                successResponseObj.data = createdAdmins;
                                return res.status(201).json(successResponseObj);
                            }).catch((err) => {
                                console.log(err);
                                return res.status(500).json({msg:"Some problem occurred while adding admins to database"});
                            });
                        }).catch((err) => {
                            console.log(err);
                            return res.status(500).json({msg:"Some problem occurred while making user super admin"});
                        });
                    }).catch((err) => {
                        console.log(err);
                        return res.status(500).json({msg:"Some problem occurred while deploying the smart contract"});
                    });
                }
                else
                {
                    if(!req.query.from)
                    {
                        return res.status(400).json({msg:"Query fields not included: from", query:req.query});
                    }
                    admins[0].Is_Super_Admin = false;
                    for(i=0; i<allAdmins.length; i++)
                    {
                        if(String(allAdmins[i]._id) === req.query.from)
                        {
                            fromObj.from = allAdmins[i].Public_Key;
                            if(!allAdmins[i].Is_Super_Admin)
                            {
                                return res.status(400).json({msg:"Only super admins can add admins", query:req.query});
                            }
                            break;
                        }
                    }
                    electionContract.deployed().then((instance) => {
                        instance.addAdmin(adminPubKeys[0], fromObj).then(() => {
                            Admin.create(admins).then((createdAdmins) => {
                                successResponseObj.data = createdAdmins;
                                return res.status(201).json(successResponseObj);
                            }).catch((err) => {
                                console.log(err);
                                return res.status(500).json({msg:"Some problem occurred while adding admins to database"});
                            });
                        }).catch((err) => {
                            console.log(err);
                            return res.status(500).json({msg:"Some problem occurred while while trying to add admin to blockchain"});
                        });
                    }).catch((err) => {
                        console.log(err);
                        return res.status(500).json({msg:"Some problem occurred while deploying the smart contract"});
                    });
                }
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({msg:"Some problem occurred while trying to fetch admins from database"});
            });
        });
    });
});

router.put('/:id', (req,res) => {
    queryObj = {};
    queryObj._id = ObjectId(req.params.id);
    if(req.body.Public_Key)
    {
        return res.status(400).json({msg:"Public Key of admin cannot be changed. You may try to delete the admin and insert again"});
    }
    if(req.body.Election_ID)
    {
        return res.status(400).json({msg:"Election ID of admin cannot be changed"});
    }
    if("Is_Super_Admin" in req.body)
    {
        return res.status(400).json({msg:"Cannot update super admin with this API."});
    }
    Admin.updateOne(queryObj,req.body, (err) => {
        if(err)
        {
            return res.status(500).json({msg:"Some problem occurred while updating admin(s)"});
        }
        return res.status(200).json({msg:"Admin(s) updated successfully", data:req.body});
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
        var inSubQuery = {};
        var queryIds = Array();
        queryIds.push(ObjectId(req.params.id));
        queryIds.push(ObjectId(req.query.from));
        inSubQuery["$in"] = queryIds;
        adminQuery._id = inSubQuery;
        Admin.find(adminQuery).then((admins) => {
            if(admins.length < 2 && (req.params.id !== req.query.from))
            {
                return res.status(400).json({msg:"Invalid admin/from admin ID(s)", input:req.query});
            }
            if((admins[0].Is_Super_Admin && req.params.id === String(admins[0]._id)) || (admins[1].Is_Super_Admin && req.params.id === String(admins[1]._id)))
            {
                return res.status(400).json({msg:"Cannot delete super admin. De-promote to admin and delete"});
            }
            var deletePubKey = (String(admins[0]._id) === req.params.id) ? admins[0].Public_Key : admins[1].Public_Key;
            var fromObj = {};
            fromObj.from = (String(admins[0]._id) === req.query.from) ? admins[0].Public_Key : admins[1].Public_Key;
            var delObj = {};
            delObj._id = ObjectId(req.params.id);
            BlockchainApp.initBlockchainServer(elections[0].Port);
            var electionContract = BlockchainApp.getSmartContract();
            electionContract.deployed().then((instance) => {
                instance.removeAdmin(deletePubKey, fromObj).then(() => {
                    Admin.remove(delObj, fromObj).then((data) => {
                        var responseObj = {};
                        responseObj.msg = "Admin deleted successfully";
                        responseObj.details = data;
                        return res.status(200).json(responseObj);
                    }).catch((err) => {
                        console.log(err);
                        return res.status(500).json({msg:"Problem occurred when trying to remove admin from database"});
                    });
                }).catch((err) => {
                    console.log(err);
                    return res.status(500).json({msg:"Problem occurred when trying to remove admin from blockchain"});
                });
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({msg:"Problem occurred when trying deploy smart contract"});
            });
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({msg:"Problem occurred when trying to fetch admin from database"});
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({msg:"Problem occurred when trying to fetch elections from database"});
    });
});

module.exports = router;