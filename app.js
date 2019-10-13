express = require('express');
app = express();
const {ObjectId} = require('mongodb');
mongoose = require('mongoose');
Election = require('./models/Election.model');
Admin = require('./models/Admin.model');

Web3 = require('web3');
truffleContract = require('truffle-contract');
path = require('path');
VotingSystem = require(path.join(__dirname, 'build/contracts/Voting_System.json'));

var web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
filePath = path.join(__dirname,'build/contracts/Voting_System.json');

var db = 'mongodb://localhost/VotingSystem';
mongoose.connect(db);

app.use(express.json());
app.use(express.urlencoded({extended:false}));

var VotingSystemContract = truffleContract(VotingSystem);
VotingSystemContract.setProvider(web3Provider);

app.get('/elections', (req,res) => {
    Election.find().then((docs) => {
        res.json(docs);
    });
});

app.post('/elections', (req,res) => {
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

app.delete('/elections/:id', (req,res) => {
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

app.get('/admins', (req,res) => {
    Admin.find().then((docs) => {
        res.json(docs);
    });
});

app.post('/admins', (req,res) => {
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

// app.get('/test/:id',(req,res) => {
//     console.log(req.query);
//     Election.find({},'_id Name', (err,data) => {
//         console.log(data);
//     });
//     res.status(200).json({msg:"Done"});
// });

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// VotingSystemContract.deployed().then((instance) => {
//     instance.getAdmins().then((admins) => {
//         console.log(admins);
//         console.log(typeof admins[0]);
//     });
// });


