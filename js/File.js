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

function File (fileName)  {  

	 /***********************************************************************************************
	  * *********************************************************************************************
	  * **************			CLASS ATTIBUTES							****************************
	  * *********************************************************************************************
	  * *********************************************************************************************/
	this.fileName =		fileName,		//this is the file name	
	this.File =		undefined, 		//this is the file content	
	this.finishedLoading = new $.Deferred();
	
	// PSEUDO CONSTRUCTOR
	$.ajax({
		  type: "GET",
		  url: this.fileName,
		  dataType: "text",
		  context: this,
		  success: function (content){
				      this.File = content;				      
				      },
		  error : this.displayError,
		  async:   false
	});
	
	/***********************************************************************************************
	 * *********************************************************************************************
	 * **************			CLASS METHODS							****************************
	 * *********************************************************************************************
	 * *********************************************************************************************/
	this.displayError = 	function () {	
	      console.log(":: ERROR :: upss the script could not open the files, Have you got access rights?");
	      alert(":: ERROR :: upss the script could not open the files, Have you got access rights?");	
	};// END method displayError	
	
	
	this.LoadDTNSetup = function () {
		var lines = inputNetworkSetup.File.split("\n");	//each line is "lines[i]"
		for(var lineIndex = 0 ; lineIndex < lines.length-1 ;  lineIndex++){
			var formattedLine = lines[lineIndex].replace(/\-\>/g,",").replace(/\(/g,",").replace(/\)/g,"").replace(/ /g,"");
			var parametersArray = formattedLine.split(',');
			if (parametersArray.length != 7 ) {	alert("DEBUG ::: loadConfig ::: ERROR!!! unexpected format of the input file "); continue; }
		
		    var ObjectOfLink = {	"idNodeOrgin":parseInt(parametersArray[0]),
		    						"idNodeDestination":parseInt(parametersArray[1]),
		    						"protocolOfLink":parametersArray[2].toUpperCase(),
		    						"bitRateOfLink":parseInt(parametersArray[3]),
		    						"startTime":parseInt(parametersArray[4]),
		    						"endTime":parseInt(parametersArray[5]),
		    						"delayOfLink": parseInt(parametersArray[6])
	    						};	
		    
		    reduceNetworkConfiguration (ObjectOfLink);
	
		}//END for each lines from File	
		
		//lastNodeId coherence check
		nodes.map(function(n) {	    if (n.id  >  lastNodeId ){	lastNodeId = n.id;	}	});	

		this.finishedLoading.resolve();
	};// END method LoadDTNSetup
	
}//END CLASS File