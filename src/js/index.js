$(document).ready(function(){
    $("#electionCreate").click(function(){
        var electionName = $('#electionName').val();
        var blockchainPort = $('#blockchainPort').val();
        electionObj = {};
        electionObj["Name"] = electionName;
        electionObj["Port"] = blockchainPort;
        electionArray = Array();
        electionArray.push(electionObj);
        $.ajax({
            type: "POST",
            url: "/elections",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({elections:electionArray}),
            success: function(response) {
                console.log(response);
            },
            error: function(response) {
                console.log(response.responseText);
            }
    });

        // $.post("/elections", electionObj,  function(data, status){
        //     console.log(status);
        //     console.log(data);
        // });
    });
});