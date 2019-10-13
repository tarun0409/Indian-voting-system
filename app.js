express = require('express');
app = express();
mongoose = require('mongoose');

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

app.use('/elections', require('./routes/api/election'));
app.use('/admins', require('./routes/api/admin'));
app.use('/candidates', require('./routes/api/candidate'));
app.use('/voters', require('./routes/api/voter'));

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// VotingSystemContract.deployed().then((instance) => {
//     instance.getAdmins().then((admins) => {
//         console.log(admins);
//         console.log(typeof admins[0]);
//     });
// });


