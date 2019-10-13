const express = require('express');
const router = express.Router();
mongoose = require('mongoose');
Admin = require('../../models/Admin.model');

router.get('/', (req,res) => {
    Admin.find().then((docs) => {
        res.json({admins:docs});
    });
});

router.post('/', (req,res) => {
    if(!req.body.admins)
    {
        return res.status(400).json({msg:"Invalid format.", input:req.body});
    }
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
    Admin.create(admins).then((data)=> {
        var responseObj = {};
        responseObj.msg = "Admin(s) inserted successfully";
        responseObj.input = data;
        res.status(201).json(responseObj);
    }).catch((err)=>{
        console.log(err);
        return res.status(500).json({msg:"Internal Server Error"}); 
    });
});

module.exports = router;