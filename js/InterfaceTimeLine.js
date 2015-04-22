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


//see spec on :
//	http://almende.github.io/chap-links-library/js/timeline/doc/


var InterfaceTimeLine = (function() {
	/**************************************************************************
	 * ************************************************************************
	 * ************** 				CLASS ATTIBUTES 					*******
	 * ************************************************************************
	 **************************************************************************/
	var timeline;
	
	var finishedLoading = new $.Deferred();

	/**************************************************************************
	 * ************************************************************************
	 * ************** 				CLASS METHODS 			*******************
	 * ************************************************************************
	 *************************************************************************/

	// callback function for the change event
	var onchanged = function(event) {
		// retrieve the changed row
		var row = getSelectedRow();

		if (row != undefined) {
			// request approval from the user.			
			var ObjectOfLink = { "startTime": networkConfiguration[row].start.getTime(), "endTime": networkConfiguration[row].end.getTime()	};
			
			var changedConfigOverlaps = networkConfiguration.some(function(nc){	
				if (nc.id == networkConfiguration[row].id) return false;
				return ( overlapingType.none != getTypeOfOverlapping(ObjectOfLink,nc) ); 
			});			
			
			if (changedConfigOverlaps == true) {	

				var approve = confirm("the change you are perfoming implies a refactorization of the Configurations, the configurations will be merged Are you sure ?");
				if (approve) {
					setNewTimes4Config(networkConfiguration[row].id,networkConfiguration[row].start,networkConfiguration[row].end);
					refreshSettingsBlock(row);					
					var temporaryCopyOfLinks = copyLinksOfConfiguration(networkConfiguration[row].id);
					
					deleteNetworkConfiguration(networkConfiguration[row].id);
					

					temporaryCopyOfLinks.map(function(l){
				   		var newObjectOfLink = {	"idNodeOrgin": l.source.id,
												"idNodeDestination": l.target.id,
												"protocolOfLink":l.protocol,
												"bitRateOfLink":l.bitRate,
												"startTime":l.startTime,
												"endTime": l.stopTime,
												"delayOfLink": l.delay
											};
						reduceNetworkConfiguration(newObjectOfLink);							
					});		
					
					timeline.redraw();
					Interface3D.restart();
					
				} else {
				// new date NOT approved. cancel the change
				 timeline.cancelChange();
				}				
			}else {
				setNewTimes4Config(networkConfiguration[row].id,networkConfiguration[row].start,networkConfiguration[row].end);				
				refreshSettingsBlock(row);				
			}
			
			
		}
	};

	
	// callback function for onrangechanged event
	var onrangechanged = function() {
		var rangeOfTimeLine = timeline.getVisibleChartRange();
		
		if (config.clientsSyncEnabled == true){
			socket.emit('syncRequestFromClient', JSON.stringify({ startTime : rangeOfTimeLine.start.getTime() , stopTime : rangeOfTimeLine.end.getTime(), action: "update"}));
		}else{
			var updateXHR = $.ajax({
		        url: 'http://' + config.ip + ':' + config.port,
		        type: 'POST',
		        beforeSend: function(xhr) {
		            xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
		            xhr.setRequestHeader("Accept","application/json;");
		        },
		        data:  JSON.stringify({ startTime : rangeOfTimeLine.start.getTime() , stopTime : rangeOfTimeLine.end.getTime(), action: "update"}) ,
		        async: false, 
				cache: false 
			});

			updateXHR.done(function(result){				
				
				result.listOfLinks.map(function(link){
					
					var ObjectOfLink = {	
						"idNodeOrgin": 			parseInt(link.from),
						"idNodeDestination": 	parseInt(link.to),
						"protocolOfLink":		link.protocol.toUpperCase(),
						"bitRateOfLink":		parseInt(link.bitRate),
						"startTime": 			parseInt(link.startTime),  
						"endTime": 				parseInt(link.stopTime),
						"delayOfLink": 			parseInt(link.delay)
					};	
					
					reduceNetworkConfiguration(ObjectOfLink);	
					
				});	
				
				InterfaceTimeLine.draw();
				Interface3D.restart();
			
				$("#settingsBlock").empty();
				
			});	
			updateXHR.fail(function(jqXHR, textStatus, errorString){		
				$("#settingsBlock").append('<div id="error_connection" data-role="popup"> <a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a>	<p><br></p> <p> ERROR!!! There is no connection to server</p></div>');
				$("#settingsBlock").trigger("create");
				$( "#error_connection" ).popup( "open" );
			});
		}
	};
	
	// callback function for the edit item
	var onedit = function() {
		var row = getSelectedRow();
		var content = networkConfiguration[row].content;
		var newContent = prompt("Enter content", content);
		if (newContent != undefined) {
			networkConfiguration[row].content = newContent;
		}
		timeline.redraw();
		refreshSettingsBlock(selected_configuration);

	};

	// Make a callback function for the select item
	var onselect = function(event) {
		var row = getSelectedRow();
		if (row != undefined) {
			selected_configuration = row;
			refreshSettingsBlock(selected_configuration);
		} else {
			// nothing
		}
	};

	// callback function for the delete item
	var ondelete = function() {
		var row = getSelectedRow();
		if (row != undefined) { // request approval from the user.
			var approve = confirm("Are you sure you want to delete this Configuration?");
			if (approve) {				
				selected_configuration = row;				
				deleteLinksAndNodesOfNetworkConfiguration(networkConfiguration[selected_configuration].id);
	
			} else {
				timeline.cancelDelete();
			}
		}
	};

	// callback function for the add item 
	// mind that a configuration is never deleted ...
	var onadd = function () { 
		var row = getSelectedRow(); 
		
		// creepy fix to avoid the empty configuration created by double clicking in the timeline
		if (typeof networkConfiguration[row].end == "undefined" ){
			var newEndingTime = networkConfiguration[row].start.getTime() + 1000000000;
			networkConfiguration[row].end = new Date(newEndingTime);		
		} 
		
		networkConfiguration[row].id = ++lastNetworkConfigurationID;
		selected_configuration = row;
		Interface3D.restart();
		redraw();
		refreshSettingsBlock(selected_configuration);
	};
	
	
	function getSelectedRow() {
		var row = undefined;
		var sel = timeline.getSelection();
		if (sel.length) {
			if (sel[0].row != undefined) {
				row = sel[0].row;
			}
		}
		return row;
	}

	// Called when the Visualization API is loaded......not now
	function init() {
		
		// specify options
		var options = {
			width : "100%",
			selectable : true,
			editable: true,
			enableKeys : true,
			axisOnTop : false,
			showNavigation : true,
			showButtonNew : true,
			animate : true,
			animateZoom : true,
			layout : "box"	
		};

		// Instantiate our timeline object.
		timeline = new links.Timeline(document.getElementById('mytimeline'),
				options);

		// attach an event listener using the links events handler
		links.events.addListener(timeline, 'edit', onedit);
		links.events.addListener(timeline, 'select', onselect);
		links.events.addListener(timeline, 'changed', onchanged);
		links.events.addListener(timeline, 'delete', ondelete);
		links.events.addListener(timeline, 'add', onadd);
		links.events.addListener(timeline, 'rangechanged', onrangechanged);		
		
		
		$("#themeswitcher").themeswitcher({imgpath: "js/timeline/img/themeswitcher/",loadtheme: "blitzer"});
		
		finishedLoading.resolve();
	}
	function redraw() {
		timeline.redraw();
	}
	// Draw our timeline with the created data and options	
	function draw() {
		timeline.draw(networkConfiguration);	
	}	
	
	function getFlag() {
		// Draw our timeline with the created data and options
		return InterfaceTimeLine.finishedLoading;
	}
	
	return {
		init : init,
		redraw : redraw,
		draw:draw,
		finishedLoading: getFlag,
		getUpdateFromServer : onrangechanged
	};

})();