/*

Copyright (c) 2015, INSYEN
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this 
list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, 
this list of conditions and the following disclaimer in the documentation and/or
 other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.

*/



/***********************************************************************************************
 * *********************************************************************************************
 * **************			CLASS ATTIBUTES							****************************
 * *********************************************************************************************
 * *********************************************************************************************/

// set up initial nodes and listOfLinks
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
// var nodes = [
//				{id: 0, reflexive: false, listOfConfigurationWherePresent : []},
//				{id: 1, reflexive: false, listOfConfigurationWherePresent : []},
//				{id: 2, reflexive: false, listOfConfigurationWherePresent : []}
//			];

//var listOfLinks = [
//						{id : 1, source: nodes[0], target: nodes[1], 
//						left: false, right: true , protocol: "TCP", 
//						bitRate : 10000, startTime : 1, stopTime : 3600, 
//						delay : 2 ,onlineInConfigurationWithID : 1}
//					];
/*
  var networkConfiguration = [
        {
        	'id' : ++ lastNetworkConfigurationID,
            'start': new Date(),
            'end': new Date(),
            'content': 'Network Configuration X'
        }]
 */
var nodes = [];
var	listOfLinks = [];
var	listOfLinksInCurrentConfiguration = [];
var listOfNodesInCurrentConfiguration = [];
var	lastNetworkConfigurationID = 0;
var	lastNodeId = 0;
var	lastLinkId = 0;


var networkConfiguration = []; 

//only respond once per keydown
var lastKeyDown = -1;

//mouse event vars
var selected_node = null,
	selected_configuration= null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

// overlapingType described getTypeOfOverlapping() 
var overlapingType = { "none" : 0 , "case_A" : 1 , "case_B": 2 , "case_C": 3, "case_D": 4, "case_E": 5,  "case_F": 6, "case_G": 7, "case_H": 8,"sameTimesAsAnother": 9  };

// handlers of the pooling for parameter of a Node
var loopPolingParametersOfNode;

//handlers of the pooling for parameter of a Node
var loopPollingOfNodesStatus;


/***********************************************************************************************
 * *********************************************************************************************
 * **************			CLASS METHODS							****************************
 * *********************************************************************************************
 * *********************************************************************************************/

function showMonitoringParametersOfNode(nodeId){
	
	$("#myPopupDiv").remove();	
	var prompt2show = 	'<div id="myPopupDiv" data-role="popup"> '+
						'	<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a>'+
						'	<p><br></p> <h2>Monitoring parameters of Node: ' + nodeId + ' </h2> '+
						'<table data-role="table" id="table-column-toggle" data-mode="columntoggle" data-enhanced="true" class="ui-table ui-table-columntoggle" data-column-btn-theme="b">'+
						'	<thead>'+  
						'		<tr>'+    
						'      <th data-priority="1" data-colstart="1" class="ui-table-priority-1 ui-table-cell-visible">parameter</th>'+
						'      <th data-colstart="2" class="ui-table-priority-1 ui-table-cell-visible">current value</th>' +						      
						'    </tr>'+
						'  </thead>'+
						'  <tbody id="monitoringParametersTable">'+
						'    <tr>'+
						'      <td class="ui-table-priority-1 ui-table-cell-visible">Parameter_1</td>'+
						'      <td id="myPopupDiv_'+ nodeId + '_parameter_1" class="ui-table-priority-3 ui-table-cell-visible">null</td>'+						      
						'    </tr>'+
						'    <tr>'+
						'      <td class="ui-table-priority-1 ui-table-cell-visible">Parameter_2</td>'+
						'      <td id="myPopupDiv_'+ nodeId + '_parameter_2" class="ui-table-priority-3 ui-table-cell-visible">null</td>'+						      
						'    </tr>'+
						'    <tr>'+
						'      <td class="ui-table-priority-1 ui-table-cell-visible">Parameter_3</td>'+
						'      <td id="myPopupDiv_'+ nodeId + '_parameter_3"  class="ui-table-priority-3 ui-table-cell-visible">null</td>'+						      
						'    </tr>'+
						'    <tr>'+
						'      <td class="ui-table-priority-1 ui-table-cell-visible">Parameter_4</td>'+
						'      <td id="myPopupDiv_'+ nodeId + '_parameter_4"  class="ui-table-priority-3 ui-table-cell-visible">null</td>'+						      
						'    </tr>'+
						'    <tr>'+
						'      <td class="ui-table-priority-1 ui-table-cell-visible">Parameter_5</td>'+
						'      <td id="myPopupDiv_'+ nodeId + '_parameter_5"  class="ui-table-priority-3 ui-table-cell-visible">null</td>'+						      
						'    </tr>'+
						' </tbody>'+
						'</table>'+	
						'	<p><br></p> <h4> last sample at:  <strong id="myPopupDiv_'+ nodeId + '_timeStamp"> </strong></h4> '+
						'</div>';
	
	$("#settingsBlock").append(prompt2show);
	$("#settingsBlock").trigger("create");
	$( "#myPopupDiv" ).popup( "open" );
	
	//Global attribute of app
	 loopPolingParametersOfNode = setInterval(function () {
		
		var request2Server = {
			node2monitor : parseInt( nodeId ) , 
			action : "status"
		};
		
		var requestXHR = $.ajax({
	        url: 'http://' + config.ip + ':' + config.port,
	        type: 'POST',
	        beforeSend: function(xhr) {
	            xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
	            xhr.setRequestHeader("Accept","application/json;");
	        },
	        data:  JSON.stringify(request2Server) ,
	        async: true, 
			cache: false 
		});

		requestXHR.done(function(listOfParameters){
			$("#monitoringParametersTable").empty();
		
			for (var key in listOfParameters) {				
				if ( key === "timestamp") {	
					var timeStamp = new Date(listOfParameters.timestamp * 1000);
					$('#myPopupDiv_'+ nodeId + '_timeStamp').html(timeStamp.toLocaleString());
				} else{
					var prompt2show = 	'    <tr>'+
					'      <td class="ui-table-priority-1 ui-table-cell-visible">' + key + '</td>'+
					'      <td class="ui-table-priority-3 ui-table-cell-visible">' + listOfParameters[key]  + '</td>'+						      
					'    </tr>';
					$("#monitoringParametersTable").append(prompt2show);					
				}								
			}
			
		});	
		requestXHR.fail(function(jqXHR, textStatus, errorString){		
			$("#monitoringParametersTable").empty();			
			console.log("DEBUG ::: showMonitoringParametersOfNode ::: updateXHR.fail");			
		});
		
	}, this.period2pollParametersOfNode); //polls every 1 seconds
	
	$("#myPopupDiv").bind({
		popupafterclose: function(event, ui) {
			clearInterval(loopPolingParametersOfNode);
		}
	});
	
}

function displaySelectedNode() {
	if (selected_node != null )	{		
		$("#settingsBlock").empty();
		var html2append = 	'<br> <h1 id="label_NodeId">Node: ' + selected_node.id + '</h1>' + 
							"<div data-role='fieldcontain'>" +
							"	<input type='button' value='check monitoring parameters' onclick='showMonitoringParametersOfNode("+ selected_node.id + ");'/> "+
							"</div>" ;
		$("#settingsBlock").append(html2append);
		$("#settingsBlock").trigger("create");
		var listOfLinkedNodes = listOfLinks.filter(function(l) {	return (l.source.id == selected_node.id);		});
		listOfLinkedNodes.map(function(l){	
			if (l.source.id == selected_node.id && l.onlineInConfigurationWithID == networkConfiguration[selected_configuration].id){  												
				showConnection2NodeOnGUI({
											toNodeWithId : l.target.id, protocol : l.protocol, bitRate : l.bitRate,
											startTime : l.startTime , stopTime : l.stopTime, delay : l.delay , linkId : l.id  
										});
			}
		});
	}
}

function showConnection2NodeOnGUI(connection){
	
	var checkedButtonTCP = "";
	var checkedButtonUDP = "";
	var checkedButtonLTP = "";
	
	if (connection.protocol.toUpperCase() =="TCP"){
		checkedButtonTCP = "checked"; checkedButtonUDP = ""; checkedButtonLTP = "";
	}if (connection.protocol.toUpperCase() =="UDP"){
		checkedButtonTCP = "";	checkedButtonUDP = "checked"; checkedButtonLTP = "";
	}if (connection.protocol.toUpperCase() == "LTP"){
		checkedButtonTCP = "";	checkedButtonUDP = ""; checkedButtonLTP = "checked";
	}	
	
	var html2insert = "	<div data-role='collapsible' id='"+ connection.linkId + "_collapsible' data-theme='a' data-content-theme='a'>" +
	"					   	<h1>Connection to Node: "+ connection.toNodeWithId + "</h1>" +
	"						<div data-role='fieldcontain'>" +
	"						    <fieldset data-role='controlgroup'>" +
	"						    	<legend>Choose a protocol:</legend>" +
	"						    		<label for='TCP'>TCP</label>" +
	"						         	<input type='radio' name='"+ connection.linkId + "_radio-choice-1' id='TCP' value='TCP' " + checkedButtonTCP + " ></input>" +
	"						         	<label for='UDP'>UDP</label>" +
	"						         	<input type='radio' name='"+ connection.linkId + "_radio-choice-1' id='UDP' value='UDP' " + checkedButtonUDP + " ></input>" +
	"						         	<label for='LTP'>LTP</label>" +
	"						         	<input type='radio' name='"+ connection.linkId + "_radio-choice-1' id='LTP' value='LTP' " + checkedButtonLTP + " ></input>" +
	"						    </fieldset>" +
	"						</div>" +
	"						<div data-role='fieldcontain'>" +
	"						    <label for='BitRate'>BitRate:</label>" +
	"						    <input type='number' name='BitRate' id='"+ connection.linkId + "_BitRate' value='"+ connection.bitRate  +"' onfocus='Interface3D.resetSelectedNode()' />" +
	"						</div>" +
	"						<div data-role='fieldcontain'>" +
	"				         <label for='delayTime'>delay in seconds:</label>" +
	"				         <input type='number' name='delayTime' id='"+ connection.linkId + "_delayTime' value='"+ connection.delay  +"' onfocus='Interface3D.resetSelectedNode()' />" +
	"						</div>" +
	"						<div data-role='fieldcontain'>" +
	"				         <input type='button' value='Modify connection' onclick='modifyConnection("+ connection.linkId + ", \"modifiedOnSettingsBlock\" );'/> "+
	"						</div>" +				
	"					</div><!-- /collapsible -->";

	$("#settingsBlock").append(html2insert);
	$("#settingsBlock").trigger("create");	

}
function modifyConnection(id, action) {	

	var linkToModify = listOfLinks.filter(function(l) {
      return (l.id === id);
    })[0];
	
	var action2post = "";
	var prompt2show = "";
	
	$("#myPopupDiv").remove();
	
	if (action == "modifiedOnSettingsBlock"){

		//create new link
		var newlink = {
			id : ++lastLinkId, source: linkToModify.source, target: linkToModify.target, left: false, right: false, 
			protocol:  $('input[name="' + id + "_radio-choice-1" + '"]:checked').val() , 
			bitRate : document.getElementById(id + "_BitRate").value, 
			startTime : linkToModify.startTime, 
			stopTime : linkToModify.stopTime, 
			delay : document.getElementById(id + "_delayTime").value, 
			onlineInConfigurationWithID : linkToModify.onlineInConfigurationWithID
		};		
		//delete old		
		modifyConnection(linkToModify.id, "deleteOnTimeLine"); 
		listOfLinks.splice(listOfLinks.indexOf(linkToModify), 1);
		//add new
		listOfLinks.push(newlink);
		modifyConnection(newlink.id, "addOnTimeLine"); 
		
		$("#settingsBlock").empty();  

		return;
		
		/*
		prompt2show = 	'<div id="myPopupDiv" data-role="popup"> '+
								'<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a>'+
								'	<p><br></p> <p>Connection from Node: '+linkToModify.source.id +' to Node: '+ linkToModify.target.id +' is succesfully modified !	</p> '+
						'</div>';
		action2post = "modify";
		*/
	}
	
	if (action == "add"){
		prompt2show = 	'<div id="myPopupDiv" data-role="popup"> '+
							'<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a>'+
							'	<p><br></p> <p>Connection from Node: '+linkToModify.source.id +' to Node: '+ linkToModify.target.id +' is succesfully added !	</p> '+
						'</div>';
		action2post = "add";
	}
	if (action == "addOnTimeLine"){
		prompt2show = "";
		action2post = "add";
	}
	if (action == "deleteOnGraph"){
		prompt2show = 	'<div id="myPopupDiv" data-role="popup"> '+
							'<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a>'+
							'	<p><br></p> <p>Connection from Node: '+linkToModify.source.id +' to Node: '+ linkToModify.target.id +' is succesfully deleted !	</p> '+
						'</div>';
		action2post = "delete";
	}
	if (action == "deleteOnGraphBecauseNodeDeletion"){
		prompt2show = 	'<div id="myPopupDiv" data-role="popup"> '+
							'<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a>'+
							'	<p><br></p> <p>links associated to the node have been removed !	</p> '+
						'</div>';
		action2post = "delete";
	}
	if (action == "deleteOnTimeLine"){
		prompt2show = "";
		action2post = "delete";
	}
	
	var update2Server = {
		from : parseInt( linkToModify.source.id ), 
		to : parseInt( linkToModify.target.id ) ,
		protocol : linkToModify.protocol, 
		bitRate : parseInt( linkToModify.bitRate ), 
		startTime : parseInt( linkToModify.startTime ) / 1000 , 
		stopTime : parseInt( linkToModify.stopTime ) / 1000, 
		delay : parseInt( linkToModify.delay ) , 
		action : action2post
	};
	
	//send POST or WebSocket event to server
	
	if (config.clientsSyncEnabled == true){
		socket.emit('updateFromClient', JSON.stringify(update2Server));
	}else{
		var updateXHR = $.ajax({
	        url: 'http://' + config.ip + ':' + config.port,
	        type: 'POST',
	        beforeSend: function(xhr) {
	            xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
	            xhr.setRequestHeader("Accept","application/json;");
	        },
	        data:  JSON.stringify(update2Server) ,
	        async: false, 
			cache: false 
		});

		updateXHR.done(function(result){
			if (prompt2show != ""){
				$("#settingsBlock").append(prompt2show);
				$("#settingsBlock").trigger("create");
				$( "#myPopupDiv" ).popup( "open" );
			}
		});	
		updateXHR.fail(function(jqXHR, textStatus, errorString){		
			$("#settingsBlock").append('<div id="error_connection" data-role="popup"> <a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a>	<p><br></p> <p> ERROR!!! No protocol found on server.</p></div>');
			$("#settingsBlock").trigger("create");
			$( "#error_connection" ).popup( "open" );
		});
	}	
}
    

function saveConfig2File (){
	
	var outputFile = "";
	listOfLinks.map(function(n) {	    
		outputFile += n.source.id + "->" + n.target.id + " (" + n.protocol + "," + n.bitRate + "," + n.startTime + "," + n.stopTime + "," + n.delay +  ")" + "\n";
	  });

	var uriContent = "data:text/octet-stream," + encodeURIComponent(outputFile);
    var caca = window.open(uriContent, 'save');
}
function refreshSettingsBlock(configurationIndex){        	
	
	$("#settingsBlock").empty();        		
	var html2insert = "	<div data-role='collapsible' id='"+ networkConfiguration[configurationIndex].id  + "_collapsible' data-collapsed='false' data-theme='a' data-content-theme='a'>" +
	"					   	<h1>Configuration: "+ networkConfiguration[configurationIndex].content + "</h1>" +
	"						<div data-role='fieldcontain'>" +
	"						    <label for='datetime-start'>Start time:</label>" +
	"						    <input type='text' name='datetime-start' id='datetime-start' value='"+ networkConfiguration[configurationIndex].start + " ' readonly/>" +
	"						</div>" +
	"						<div data-role='fieldcontain'>" +
	"						    <label for='datetime-end'>End time:</label>" +
	"						    <input type='text' name='datetime-end' id='datetime-end' value='"+ networkConfiguration[configurationIndex].end + " ' readonly/>" +
	"						</div>" + 
	"						<div data-role='fieldcontain'>" +
	"				         <input type='button' value='copy configuration' onclick='copyConfiguration("+ configurationIndex + ");' /> "+
	"						</div>" + 
	"						<div data-role='fieldcontain'>" +
	"				         <input type='button' value='Add a new Node' onclick='showDialogAddNewNode("+ configurationIndex + ");' /> "+
	"						</div>" + 
	"					</div><!-- /collapsible -->";
//	"					<div data-role='collapsible' id='"+ networkConfiguration[configurationIndex].id  + "_collapsible_newNode' data-collapsed='false' data-theme='a' data-content-theme='a'>" +
//	"					   	<h1>Add a new Node on :"+ networkConfiguration[configurationIndex].content + "</h1>" +
//	"						<div data-role='fieldcontain'>" +
//	"						    <label for='NodeNumber'>Node Number:</label>" +
//	"						    <input type='number' name='NodeNumber' id='"+ networkConfiguration[configurationIndex].id + "_NodeNumber' value='' onfocus='Interface3D.resetSelectedNode()' />" +
//	"						</div>" +	
//	"						<div data-role='fieldcontain'>"+
//	"   						<label for='NodeColor' class='select'>Node Color:</label>"+
//	"   						<select name='NodeColor' id='"+ networkConfiguration[configurationIndex].id + "_NodeColor' >"+
//	"      							<option value='dodgerblue'>BLUE: waypoint</option>"+
//	"								<option value='orange'>ORANGE: Satellite Relay </option>"+
//	"      							<option value='limegreen'>GREEN: Currier -  cubeSat</option>"+
//	"      							<option value='red'>RED: HotSpot - GroundStation</option>"+
//	"   						</select>"+
//	"						</div>"+
//	"						<div data-role='fieldcontain'>" +
//	"				         <input type='button' value='Add new node' onclick='addNewNode("+ configurationIndex + ");' /> "+
//	"						</div>" + 
//	"					</div><!-- /collapsible -->" ;
	
	$("#settingsBlock").append(html2insert);
	$("#settingsBlock").trigger("create");
	Interface3D.restart();
	$( "div[data-role|='collapsible']" ).collapsible({  
		   expand: function(event, ui) { 
					}
	});
}


function showDialogAddNewNode(configurationIndex){
	var prompt2show =
			"<div id='myPopupDiv_"  + networkConfiguration[configurationIndex].id + "' data-role='popup'> "+
			"<a href='#' data-rel='back' data-role='button' data-theme='a' data-icon='delete' data-iconpos='notext' class='ui-btn-right'></a>"+
			"					<div data-role='collapsible' id='"+ networkConfiguration[configurationIndex].id  + "_collapsible_newNode' data-collapsed='false' data-theme='a' data-content-theme='a'>" +
			"					   	<h1>Add a new Node on :"+ networkConfiguration[configurationIndex].content + "</h1>" +
			"						<div data-role='fieldcontain'>" +
			"						    <label for='NodeNumber'>Node Number:</label>" +
			"						    <input type='number' name='NodeNumber' id='"+ networkConfiguration[configurationIndex].id + "_NodeNumber' value='' onfocus='Interface3D.resetSelectedNode()' />" +
			"						</div>" +	
			"						<div data-role='fieldcontain'>"+
			"   						<label for='NodeColor' class='select'>Node Color:</label>"+
			"   						<select name='NodeColor' id='"+ networkConfiguration[configurationIndex].id + "_NodeColor' >"+
			"      							<option value='dodgerblue'>BLUE: waypoint</option>"+
			"								<option value='orange'>ORANGE: Satellite Relay </option>"+
			"      							<option value='limegreen'>GREEN: Currier -  cubeSat</option>"+
			"      							<option value='red'>RED: HotSpot - GroundStation</option>"+
			"   						</select>"+
			"						</div>"+
			"						<div data-role='fieldcontain'>" +
			"				         <input type='button' value='Add new node' onclick='addNewNode("+ configurationIndex + ");' /> "+
			"						</div>" + 
			"					</div><!-- /collapsible -->" +
			"</div>";
	
	$("#settingsBlock").append(prompt2show);
	$("#settingsBlock").trigger("create");
	$( "#myPopupDiv_"+networkConfiguration[configurationIndex].id ).popup( "open" );

}

function addNewNode(configurationIndex){
	
	var NodeNumber = document.getElementById(networkConfiguration[configurationIndex].id + "_NodeNumber").value;
	var e = document.getElementById(networkConfiguration[configurationIndex].id + "_NodeColor");
	var NodeColor = e.options[e.selectedIndex].value;
	
	if (NodeNumber == ""){
		alert("you must add an ID number for the Node");
		return;
	}
	
	var nodeExist = false;
	
	nodes.map(function(n) {	 
		if (n.id == NodeNumber){ 
			nodeExist = true;	
			
			if (n.listOfConfigurationWherePresent.indexOf(networkConfiguration[configurationIndex].id) == -1 ){
		    	n.listOfConfigurationWherePresent.push(networkConfiguration[configurationIndex].id);
		    	alert("node already exists , mind that the type of node remains the same");
		    	$( "#myPopupDiv_"+networkConfiguration[configurationIndex].id ).popup( "close" );
		    }else{
		    	alert("upss node already exists , check it out!");
		    	return;
		    }
		}
	});
	
		
	if (nodeExist == false){		
	  var node = {id: NodeNumber, reflexive: false, listOfConfigurationWherePresent : [] };
	  node.x = 1;//point[0];
	  node.y = 1;//point[1];
	  node.color = NodeColor;
	  node.listOfConfigurationWherePresent.push(networkConfiguration[configurationIndex].id);
	  nodes.push(node);
	  $( "#myPopupDiv_"+networkConfiguration[configurationIndex].id ).popup( "close" );
	  
	}
	
	Interface3D.restart();

	
}

function modifyNode( NodeNumber , status ){
	
	nodes.map(function(n) {
		
		if (n.id == NodeNumber){
			
			if (status == "valid")
				n.color = "dodgerblue";
			if (status == "invalid")
				n.color = "red";
			
		}
		
	});	
	
}

function checkStatusOfNodes (){
	
	//Global attribute of app
	loopPollingOfNodesStatus = setInterval(function () {
		
		var nodes2askStatus = [];
		
		nodes.map(function(n) {	
			nodes2askStatus.push( parseInt(n.id) );
		});
		
		var request2Server = {
			nodes :  nodes2askStatus, 
			action : "updateNode"
		};
		
		var requestXHR = $.ajax({
	       url: 'http://' + config.ip + ':' + config.port,
	       type: 'POST',
	       beforeSend: function(xhr) {
	           xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
	           xhr.setRequestHeader("Accept","application/json;");
	       },
	       data:  JSON.stringify(request2Server) ,
	       async: true, 
		   cache: false 
		});

		requestXHR.done(function(result){
					
			for (var key in result.nodeStatus) {				
				modifyNode( key, result.nodeStatus[key] );				
			}
			
			Interface3D.restart();
			
		});
		
		requestXHR.fail(function(jqXHR, textStatus, errorString){					
			console.log("DEBUG ::: checkStatusOfNodes ::: updateXHR.fail");			
		});
		
	}, config.period2pollStatusOfNodes); //polls every 1 seconds	
	
}



function copyConfiguration(configurationIndex){	
	
	var startDateOfNewConfiguration = networkConfiguration[configurationIndex].end.getTime();
	var endDateOfNewConfiguration = networkConfiguration[configurationIndex].end.getTime() +
									(networkConfiguration[configurationIndex].end.getTime() - networkConfiguration[configurationIndex].start.getTime());
	
	var newConfiguration = {
		'id' : ++lastNetworkConfigurationID,
    	'start': new Date(startDateOfNewConfiguration),
        'end': new Date(endDateOfNewConfiguration),
        'content': 'Copy of ' + networkConfiguration[configurationIndex].content
    };
	networkConfiguration.push(newConfiguration);
	
	listOfLinks.map(function(l) {	
		if(l.onlineInConfigurationWithID == networkConfiguration[configurationIndex].id){
			var link = {
				id : ++lastLinkId, source: l.source, target: l.target, left: false, 
				right: true, protocol:  l.protocol, bitRate : l.bitRate, 
				startTime : startDateOfNewConfiguration , stopTime : endDateOfNewConfiguration , 
				delay : l.delay , onlineInConfigurationWithID : newConfiguration.id 
			};
		    listOfLinks.push(link);
		    modifyConnection(link.id, "addOnTimeLine");
		}
	  });
	
	nodes.map(function(n) {	
		if (n.listOfConfigurationWherePresent.indexOf(networkConfiguration[configurationIndex].id) != -1 ){
			n.listOfConfigurationWherePresent.push(newConfiguration.id);
		}
	});	
	
	Interface3D.restart();
	InterfaceTimeLine.redraw(); 
}

function insertNewLink2Config(ObjectOfLink,idOfNetConfig){

	//check if the link is already included
	
	var isAlreadyIncluded = listOfLinks.some(function(l){
		return (ObjectOfLink.idNodeOrgin == l.source.id  &&
				ObjectOfLink.idNodeDestination == l.target.id &&
				ObjectOfLink.protocolOfLink.toUpperCase() == l.protocol.toUpperCase()  &&
				ObjectOfLink.bitRateOfLink == l.bitRate &&
				ObjectOfLink.startTime == l.startTime &&
				ObjectOfLink.endTime == l.stopTime  &&
				ObjectOfLink.delayOfLink == l.delay);		
	});
	
	if (isAlreadyIncluded == false) {		
		
		var nodeOrgin = null;
		var nodeDestination  = null;
		var existsNodeOrgin = false;
		var existsNodeDestination = false;
		
		nodes.map(function(n) {
			    if (n.id == ObjectOfLink.idNodeOrgin ){	
			    	existsNodeOrgin = true;	
			    	nodeOrgin = n ;
				    if (n.listOfConfigurationWherePresent.indexOf(idOfNetConfig) == -1 ){
				    	n.listOfConfigurationWherePresent.push(idOfNetConfig);
				    }
			    }
			    if (n.id == ObjectOfLink.idNodeDestination ){	
			    	existsNodeDestination = true; 
			    	nodeDestination = n ;
				    if (n.listOfConfigurationWherePresent.indexOf(idOfNetConfig) == -1 ){
				    	n.listOfConfigurationWherePresent.push(idOfNetConfig);
				    }
			    }

			  });			
		
		if( existsNodeOrgin == false) {
			nodeOrgin = {id: ObjectOfLink.idNodeOrgin, reflexive: false, listOfConfigurationWherePresent : [] };
			nodeOrgin.listOfConfigurationWherePresent.push(idOfNetConfig);
			++lastNodeId;
			nodeOrgin.color = "dodgerblue";

		    nodes.push(nodeOrgin);
	    } 
		if(existsNodeDestination == false) {
			nodeDestination = {id: ObjectOfLink.idNodeDestination, reflexive: false, listOfConfigurationWherePresent :  [] };
			nodeDestination.listOfConfigurationWherePresent.push(idOfNetConfig);
			++lastNodeId;
			nodeDestination.color = "dodgerblue";
		    nodes.push(nodeDestination);
	    }
		
		var link = {
			id : ++lastLinkId, source: nodeOrgin, target: nodeDestination, left: false, 
			right: false, protocol:  ObjectOfLink.protocolOfLink, bitRate : ObjectOfLink.bitRateOfLink, 
			startTime : ObjectOfLink.startTime, stopTime : ObjectOfLink.endTime, 
			delay : ObjectOfLink.delayOfLink, onlineInConfigurationWithID : idOfNetConfig
		};
		
	    link.right = true;
	    listOfLinks.push(link);
	    
	}
	
}

function copyLinksOfConfiguration(idOfNetConfig){
	
	var CopyOfConfig = networkConfiguration.filter(function(nc) {	
		return (nc.id == idOfNetConfig);		
	})[0];
	
	var newListOfLinks = [];
	
	if (CopyOfConfig){
		listOfLinks.map(function(l) {	
			if(l.onlineInConfigurationWithID == idOfNetConfig){
				var link = {
						id : ++lastLinkId, source: l.source, target: l.target, left: false, 
						right: true, protocol:  l.protocol, bitRate : l.bitRate, 
						startTime : CopyOfConfig.start.getTime() , stopTime : CopyOfConfig.end.getTime() , 
						delay : l.delay , onlineInConfigurationWithID : idOfNetConfig 
				};
				newListOfLinks.push(link);
			}
		  });
	}
	
	return newListOfLinks;
	
}


function getCopyOfConfig(idOfNetConfig){

	var CopyOfConfig = networkConfiguration.filter(function(nc) {	
		return (nc.id == idOfNetConfig);		
	})[0];
	
	if (CopyOfConfig){
		var newConfiguration = {
	        	'id' : ++ lastNetworkConfigurationID,
	            'start': CopyOfConfig.start,
	            'end': CopyOfConfig.end,
	            'content': 'Network Configuration ' + lastNetworkConfigurationID
	        };
		networkConfiguration.push(newConfiguration);
		
		listOfLinks.map(function(l) {	
			if(l.onlineInConfigurationWithID == idOfNetConfig){
				var link = {
						id : ++lastLinkId, source: l.source, target: l.target, left: false, 
						right: true, protocol:  l.protocol, bitRate : l.bitRate, 
						startTime : CopyOfConfig.start.getTime() , stopTime : CopyOfConfig.end.getTime() , 
						delay : l.delay , onlineInConfigurationWithID : newConfiguration.id 
				};
			    listOfLinks.push(link);
			    modifyConnection(link.id, "addOnTimeLine");
			}
		  });
		
		nodes.map(function(n) {	
			 if (n.listOfConfigurationWherePresent.indexOf(idOfNetConfig) != -1 ){
			    	n.listOfConfigurationWherePresent.push(newConfiguration.id);
			    }
		  });
		
		return newConfiguration;

	}else
		return undefined;
	
	
}


function setNewTimes4Config(idOfNetConfig,start,end){
	networkConfiguration.map(function(nc) {	
		if(nc.id == idOfNetConfig){
			if (start != null) 	{	nc.start = start;	}
			if (end != null) 	{		nc.end = end;	}
		}		
	});
	
	listOfLinks.map(function(l) {
		if (l.onlineInConfigurationWithID == idOfNetConfig) {
			modifyConnection(l.id, "deleteOnTimeLine");
			if (start != null) 	{	l.startTime = start.getTime();	}			
			if (end != null) 	{	l.stopTime = end.getTime();	}			
			modifyConnection(l.id, "addOnTimeLine");
		}
	});
	
	
	
}


function deleteNetworkConfiguration (idOfNetConfig){
	$("#settingsBlock").empty();
	
	var toSplice = listOfLinks.filter(function(l) { 
		 return  (l.onlineInConfigurationWithID == idOfNetConfig); 
	});				
	toSplice.map(function(l) {
		modifyConnection(l.id, "deleteOnTimeLine");
		listOfLinks.splice(listOfLinks.indexOf(l), 1);
	});					
					
	nodes.map(function(n) {	
		var indexOfconfigInListOfConfigurationWherePresent = n.listOfConfigurationWherePresent.indexOf(idOfNetConfig);
		if (indexOfconfigInListOfConfigurationWherePresent != -1 ){
			 n.listOfConfigurationWherePresent.splice(indexOfconfigInListOfConfigurationWherePresent,1);
		}
	});
	
	Interface3D.restart();
	
	var toSplice = null;
	var toSplice = networkConfiguration.filter(function(n) { 
		 return  (n.id == idOfNetConfig); 
	});				
	toSplice.map(function(n) {
		networkConfiguration.splice(networkConfiguration.indexOf(n), 1);
	});	
	
}


function deleteLinksAndNodesOfNetworkConfiguration(idOfNetConfig){
	$("#settingsBlock").empty();
	
	var toSplice = listOfLinks.filter(function(l) { 
		 return  (l.onlineInConfigurationWithID == idOfNetConfig); 
	});				
	toSplice.map(function(l) {
		modifyConnection(l.id, "deleteOnTimeLine");
		listOfLinks.splice(listOfLinks.indexOf(l), 1);
	});					
					
	nodes.map(function(n) {	
		var indexOfconfigInListOfConfigurationWherePresent = n.listOfConfigurationWherePresent.indexOf(idOfNetConfig);
		if (indexOfconfigInListOfConfigurationWherePresent != -1 ){
			 n.listOfConfigurationWherePresent.splice(indexOfconfigInListOfConfigurationWherePresent,1);
		}
	});
	
	Interface3D.restart();
	
}

function getTypeOfOverlapping(ObjectOfLink,ExistentConfig){
	
	/*	CASE A
	 *     			 				 ___________________
	 * ObjectOfLink					|___________________|	
	 * 			 				 _____________________________
	 * ExistentConfig			|_____________________________|	
	 *  
	 * */    	
	if (	ObjectOfLink.startTime > ExistentConfig.start.getTime() && 
			ObjectOfLink.endTime < ExistentConfig.end.getTime()){
		return overlapingType.case_A ;
	}
	/*	CASE B
	 *     			 			 ___________________
	 * ObjectOfLink				|___________________|	
	 * 			 						 _____________________________
	 * ExistentConfig					|_____________________________|	
	 *  
	 * */    	
	if (	ObjectOfLink.startTime < ExistentConfig.start.getTime() && 
			ObjectOfLink.endTime > ExistentConfig.start.getTime()	&&
			ObjectOfLink.endTime < ExistentConfig.end.getTime() ){
		return overlapingType.case_B ;		
	}
	/*	CASE C
	 *     			 			 ___________________
	 * ObjectOfLink				|___________________|	
	 * 			 				 _____________________________
	 * ExistentConfig			|_____________________________|	
	 *  
	 * */    	
	if (	ObjectOfLink.startTime == ExistentConfig.start.getTime() && 
			ObjectOfLink.endTime < ExistentConfig.end.getTime()){
		return overlapingType.case_C ;		
	}
	/*	CASE D
	 *     			 			 			 ___________________
	 * ObjectOfLink							|___________________|	
	 * 			 				 _______________________________
	 * ExistentConfig			|_______________________________|	
	 *  
	 * */    	
	if (	ObjectOfLink.startTime > ExistentConfig.start.getTime() && 
			ObjectOfLink.endTime == ExistentConfig.end.getTime()){
		return overlapingType.case_D ;
	}    	
	/*	CASE E
	 *     			 			 			 	 	 ___________________
	 * ObjectOfLink									|___________________|	
	 * 			 				 _______________________________
	 * ExistentConfig			|_______________________________|	
	 *  
	 * */    	
	if (	ObjectOfLink.startTime > ExistentConfig.start.getTime() && 
			ObjectOfLink.startTime < ExistentConfig.end.getTime()	&&
			ObjectOfLink.endTime > ExistentConfig.end.getTime() ){
		return overlapingType.case_E ;
	}    	
   	/*	CASE F
	 *     			 			 ___________________________
	 * ObjectOfLink				|___________________________|	
	 * 			 				 ___________________
	 * ExistentConfig			|___________________|	
	 *  
	 * */    	
	if (	ObjectOfLink.startTime == ExistentConfig.start.getTime() && 
			ObjectOfLink.endTime > ExistentConfig.end.getTime()){
		return overlapingType.case_F ;		
	} 
   	/*	CASE G
	 *     			 			 _______________________________ 			 
	 * ObjectOfLink				|_______________________________|	
	 * 			 				 			 ___________________
	 * ExistentConfig						|___________________|
	 *  
	 * */    	
	if (	ObjectOfLink.startTime < ExistentConfig.start.getTime() && 
			ObjectOfLink.endTime == ExistentConfig.end.getTime()){
		return overlapingType.case_G ;
	}    	
	/*	CASE H
	 *     			 			 ______________________________
	 * ObjectOfLink				|______________________________|	
	 * 			 				 		 _____________
	 * ExistentConfig					|_____________|	
	 *  
	 * */    	
	if (	ObjectOfLink.startTime < ExistentConfig.start.getTime() && 
			ObjectOfLink.endTime > ExistentConfig.end.getTime()){
		return overlapingType.case_H ;
	}
	/*	CASE sameTimesAsAnother
	 *     			 			 _____________________________
	 * ObjectOfLink				|_____________________________|	
	 * 			 				 _____________________________
	 * ExistentConfig			|_____________________________|	
	 *  
	 * */    	
	if (	ObjectOfLink.startTime == ExistentConfig.start.getTime() && 
			ObjectOfLink.endTime == ExistentConfig.end.getTime()){
		return overlapingType.sameTimesAsAnother ;
	}else {
		return overlapingType.none;
	}
}

function getFileData(myFile){
    var file = myFile.files[0];  
    var filename = file.name;
    console.log(filename);
 }




function reduceNetworkConfiguration(ObjectOfLink){

	var typeOfOverlaping = overlapingType.none;
	var configurationInvolved = null;
    networkConfiguration.map(function(ExistentConfig) {
   	
    	
    	/*	CASE A
    	 *     			 				 ___________________
    	 * ObjectOfLink					|___________________|	
    	 * 			 				 _____________________________
    	 * ExistentConfig			|_____________________________|	
    	 *  
    	 * */    	
    	if (	ObjectOfLink.startTime > ExistentConfig.start.getTime() && 
    			ObjectOfLink.endTime < ExistentConfig.end.getTime()){
    		typeOfOverlaping = overlapingType.case_A ;     		
    	     	
        	var copyOfExistentConfig = getCopyOfConfig(ExistentConfig.id);
        	setNewTimes4Config(copyOfExistentConfig.id,null,new Date(ObjectOfLink.startTime));
        	setNewTimes4Config(ExistentConfig.id,new Date(ObjectOfLink.startTime),null);
 		
        	reduceNetworkConfiguration(ObjectOfLink);	
    	}
    	/*	CASE B
    	 *     			 			 ___________________
    	 * ObjectOfLink				|___________________|	
    	 * 			 						 _____________________________
    	 * ExistentConfig					|_____________________________|	
    	 *  
    	 * */    	
    	if (	ObjectOfLink.startTime < ExistentConfig.start.getTime() && 
    			ObjectOfLink.endTime > ExistentConfig.start.getTime()	&&
    			ObjectOfLink.endTime < ExistentConfig.end.getTime() ){
    		typeOfOverlaping = overlapingType.case_B ; 
    		
    		var newObjectOfLink = {	"idNodeOrgin": ObjectOfLink.idNodeOrgin,
									"idNodeDestination": ObjectOfLink.idNodeDestination,
									"protocolOfLink":ObjectOfLink.protocolOfLink,
									"bitRateOfLink":ObjectOfLink.bitRateOfLink,
									"startTime":ObjectOfLink.startTime,
									"endTime": ExistentConfig.start.getTime() ,
									"delayOfLink": ObjectOfLink.delayOfLink
								};	
    		ObjectOfLink.startTime = ExistentConfig.start.getTime();
    		
    		reduceNetworkConfiguration(newObjectOfLink);
    		reduceNetworkConfiguration(ObjectOfLink);    		
    		
    	}
    	/*	CASE C
    	 *     			 			 ___________________
    	 * ObjectOfLink				|___________________|	
    	 * 			 				 _____________________________
    	 * ExistentConfig			|_____________________________|	
    	 *  
    	 * */    	
    	if (	ObjectOfLink.startTime == ExistentConfig.start.getTime() && 
    			ObjectOfLink.endTime < ExistentConfig.end.getTime()){
    		typeOfOverlaping = overlapingType.case_C ; 
    		
           	var copyOfExistentConfig = getCopyOfConfig(ExistentConfig.id);
        	setNewTimes4Config(copyOfExistentConfig.id,new Date(ObjectOfLink.endTime),null);
        	
        	setNewTimes4Config(ExistentConfig.id,null,new Date(ObjectOfLink.endTime));
    		
    		reduceNetworkConfiguration(ObjectOfLink);
    		
    	}
    	/*	CASE D
    	 *     			 			 			 ___________________
    	 * ObjectOfLink							|___________________|	
    	 * 			 				 _______________________________
    	 * ExistentConfig			|_______________________________|	
    	 *  
    	 * */    	
    	if (	ObjectOfLink.startTime > ExistentConfig.start.getTime() && 
    			ObjectOfLink.endTime == ExistentConfig.end.getTime()){
    		typeOfOverlaping = overlapingType.case_D ;   
    		
          	var copyOfExistentConfig = getCopyOfConfig(ExistentConfig.id);
        	setNewTimes4Config(copyOfExistentConfig.id,null,new Date(ObjectOfLink.startTime));
        	
        	setNewTimes4Config(ExistentConfig.id,new Date(ObjectOfLink.startTime),null);
    		
    		reduceNetworkConfiguration(ObjectOfLink);
    		
    		
    	}    	
    	/*	CASE E
    	 *     			 			 			 	 	 ___________________
    	 * ObjectOfLink									|___________________|	
    	 * 			 				 _______________________________
    	 * ExistentConfig			|_______________________________|	
    	 *  
    	 * */    	
    	if (	ObjectOfLink.startTime > ExistentConfig.start.getTime() && 
    			ObjectOfLink.startTime < ExistentConfig.end.getTime()	&&
    			ObjectOfLink.endTime > ExistentConfig.end.getTime() ){
    		typeOfOverlaping = overlapingType.case_E ; 
    		
    		var newObjectOfLink = {	"idNodeOrgin": ObjectOfLink.idNodeOrgin,
									"idNodeDestination": ObjectOfLink.idNodeDestination,
									"protocolOfLink":ObjectOfLink.protocolOfLink,
									"bitRateOfLink":ObjectOfLink.bitRateOfLink,
									"startTime": ExistentConfig.end.getTime(), 
									"endTime":  ObjectOfLink.endTime ,
									"delayOfLink": ObjectOfLink.delayOfLink
								};	
			ObjectOfLink.endTime = ExistentConfig.end.getTime();
			
			reduceNetworkConfiguration(newObjectOfLink);
			reduceNetworkConfiguration(ObjectOfLink);    		
    		
    	}    	
       	/*	CASE F
    	 *     			 			 ___________________________
    	 * ObjectOfLink				|___________________________|	
    	 * 			 				 ___________________
    	 * ExistentConfig			|___________________|	
    	 *  
    	 * */    	
    	if (	ObjectOfLink.startTime == ExistentConfig.start.getTime() && 
    			ObjectOfLink.endTime > ExistentConfig.end.getTime()){
    		typeOfOverlaping = overlapingType.case_F ; 
    		
    		var newObjectOfLink = {	"idNodeOrgin": ObjectOfLink.idNodeOrgin,
									"idNodeDestination": ObjectOfLink.idNodeDestination,
									"protocolOfLink":ObjectOfLink.protocolOfLink,
									"bitRateOfLink":ObjectOfLink.bitRateOfLink,
									"startTime": ObjectOfLink.startTime,  
									"endTime": ExistentConfig.end.getTime(),
									"delayOfLink": ObjectOfLink.delayOfLink
								};	
			ObjectOfLink.startTime = ExistentConfig.end.getTime();
			
			reduceNetworkConfiguration(newObjectOfLink);
			reduceNetworkConfiguration(ObjectOfLink);
    		
    	} 
       	/*	CASE G
    	 *     			 			 _______________________________ 			 
    	 * ObjectOfLink				|_______________________________|	
    	 * 			 				 			 ___________________
    	 * ExistentConfig						|___________________|
    	 *  
    	 * */    	
    	if (	ObjectOfLink.startTime < ExistentConfig.start.getTime() && 
    			ObjectOfLink.endTime == ExistentConfig.end.getTime()){
    		typeOfOverlaping = overlapingType.case_G ;     		
    		
    		var newObjectOfLink = {	"idNodeOrgin": ObjectOfLink.idNodeOrgin,
					"idNodeDestination": ObjectOfLink.idNodeDestination,
					"protocolOfLink":ObjectOfLink.protocolOfLink,
					"bitRateOfLink":ObjectOfLink.bitRateOfLink,
					"startTime": ObjectOfLink.startTime,  
					"endTime": ExistentConfig.start.getTime(),
					"delayOfLink": ObjectOfLink.delayOfLink
				};	
			ObjectOfLink.startTime = ExistentConfig.start.getTime();
			
			reduceNetworkConfiguration(newObjectOfLink);
			reduceNetworkConfiguration(ObjectOfLink);
    		
    	}    	
    	/*	CASE H
    	 *     			 			 ______________________________
    	 * ObjectOfLink				|______________________________|	
    	 * 			 				 		 _____________
    	 * ExistentConfig					|_____________|	
    	 *  
    	 * */    	
    	if (	ObjectOfLink.startTime < ExistentConfig.start.getTime() && 
    			ObjectOfLink.endTime > ExistentConfig.end.getTime()){
    		typeOfOverlaping = overlapingType.case_H ; 

    		var newObjectOfLink = {	"idNodeOrgin": ObjectOfLink.idNodeOrgin,
									"idNodeDestination": ObjectOfLink.idNodeDestination,
									"protocolOfLink":ObjectOfLink.protocolOfLink,
									"bitRateOfLink":ObjectOfLink.bitRateOfLink,
									"startTime": ObjectOfLink.startTime,  
									"endTime": ExistentConfig.start.getTime(),
									"delayOfLink": ObjectOfLink.delayOfLink
								};	
			ObjectOfLink.startTime = ExistentConfig.start.getTime();
			
			reduceNetworkConfiguration(newObjectOfLink);
			reduceNetworkConfiguration(ObjectOfLink);


    	}
    	/*	CASE sameTimesAsAnother
    	 *     			 			 _____________________________
    	 * ObjectOfLink				|_____________________________|	
    	 * 			 				 _____________________________
    	 * ExistentConfig			|_____________________________|	
    	 *  
    	 * */    	
    	if (	ObjectOfLink.startTime == ExistentConfig.start.getTime() && 
    			ObjectOfLink.endTime == ExistentConfig.end.getTime()){
    		typeOfOverlaping = overlapingType.sameTimesAsAnother ; configurationInvolved = ExistentConfig;
    	}
    	
    });
    		    
    
    
    switch (typeOfOverlaping){
    case overlapingType.none:		    	
    	var newID = ++lastNetworkConfigurationID;
		var newConfiguration = {
									'id' : newID,
				                	'start': new Date(ObjectOfLink.startTime),
				                    'end': new Date(ObjectOfLink.endTime),
				                    'content': 'Network Configuration ' + newID
				                };				
		networkConfiguration.push(newConfiguration);
		insertNewLink2Config(ObjectOfLink,newConfiguration.id);
    	break;	
	
    case overlapingType.sameTimesAsAnother:
    	insertNewLink2Config(ObjectOfLink,configurationInvolved.id);
    	break;	
    default :
	    				    	
    }
	
}


/***********************************************************************************************
 * *********************************************************************************************
 * **************				MAIN PROGRAM						****************************
 * *********************************************************************************************
 * *********************************************************************************************/

// load the configuration of this GUI IP/port to back-end server
var config = new Config();

// init D3 force layout
Interface3D.init(); 

// init timeLine objects
InterfaceTimeLine.init();

// Read File of the DTN Setup ( Synchronous invocation)
//var inputNetworkSetup = new File("./config/input.txt");

//load objects from the data of the File
// inputNetworkSetup.LoadDTNSetup();

//starts with polling the DTN asking for the status of each Node
checkStatusOfNodes();




	
var socket ;	

	


/***********************************************************************************************
 * *********************************************************************************************
 * **************				BINDING EVENTS 						****************************
 * *********************************************************************************************
 * *********************************************************************************************/

var documentReady = new $.Deferred();
var mainPageReady = new $.Deferred();

$.when( InterfaceTimeLine.finishedLoading, documentReady, mainPageReady ).done(function(){
	//load network's links from the server
	InterfaceTimeLine.getUpdateFromServer();	
	InterfaceTimeLine.draw();
	//Interface3D.restart();
});

$("body").on('pagecontainertransition', function( event, ui ) {
    if (ui.options.target == "#MainPage"){    
    	mainPageReady.resolve();
    }
});

$('#fileupload').change( function(event) {
	var tmppath = event.target.files[0];
	console.log(JSON.stringify(tmppath));       
});

$(document).ready(function () {
	setTimeout(function(){		
		$("body").pagecontainer("change", "#MainPage");	
		$.mobile.selectmenu.prototype.options.nativeMenu = false;
		documentReady.resolve();
	},2000); 
});




if (config.clientsSyncEnabled == true){
	socket = io.connect('http://' + config.ip + ':' + config.port);

	socket.on('updateFromServer', function(input) {	
		
		var updateObject = JSON.parse(input);
		console.log("DEBUG ::: updateFromServer triggered :: " + JSON.stringify(updateObject));
		
		if(updateObject.action == "add") {
			var ObjectOfLink = {	"idNodeOrgin": updateObject.from,
									"idNodeDestination": updateObject.to,
									"protocolOfLink":updateObject.protocol,
									"bitRateOfLink":updateObject.bitRate,
									"startTime": updateObject.startTime,  
									"endTime": updateObject.stopTime,
									"delayOfLink": updateObject.delay
								};	
			console.log("DEBUG ::: updateFromServer triggered ::  add :: " + JSON.stringify(ObjectOfLink));
			reduceNetworkConfiguration(ObjectOfLink);
	
		}
		
		if(updateObject.action == "delete") {
		  
		  var toSplice = listOfLinks.filter(function(l) {
		     return (l.startTime === updateObject.startTime &&
		    		 l.stopTime === updateObject.stopTime && 
		    		 l.protocol == updateObject.protocol &&
		    		 l.bitRate == updateObject.bitRate &&
		    		 l.delay == updateObject.delay );
		  });
		  toSplice.map(function(l) {
		    listOfLinks.splice(listOfLinks.indexOf(l), 1);
			console.log("DEBUG ::: updateFromServer triggered ::  delete :: " + JSON.stringify(updateObject));
	
		  });
	
		}
	
		InterfaceTimeLine.draw();
		Interface3D.restart();
	
		$("#settingsBlock").empty();  
		
		
	}); 
}
