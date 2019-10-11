App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // if (typeof web3 !== 'undefined') {
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    //   web3 = new Web3(App.web3Provider);
    // }
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Voting_System.json", function(vs) {
      App.contracts.VotingSystem = TruffleContract(vs);
      App.contracts.VotingSystem.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        var userString = "<p>Current Account Address : "+account+" </p>";
        $( "#userInfo" ).html( userString );
      }
    });

    App.contracts.VotingSystem.deployed().then(function(instance) {
      var admins = instance.getAdmins();
      return admins;
    }).then(function(admins) {
      console.log(admins);
      for(i=0; i<admins.length; i++)
      {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        var adminStr = document.createTextNode(admins[i]);
        td.appendChild(adminStr);
        tr.appendChild(td);
        document.getElementById("adminListBody").appendChild(tr);
      }
    });
  },

  addAdmin : function() {
    var textValue = document.getElementById("addAdminTextBox").value;
    App.contracts.VotingSystem.deployed().then(function(instance) {
      web3.eth.getAccounts(function(err, accounts){
        instance.addAdmin(accounts[1],{from:accounts[0]});
        document.getElementById("adminListBody").innerHTML = '';
        App.render();
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
