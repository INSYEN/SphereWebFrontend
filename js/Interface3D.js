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


var Interface3D = (function () {
	/**************************************************************************
	 * ************************************************************************
	 * ************** 				CLASS ATTIBUTES 					*******
	 * ************************************************************************
	 **************************************************************************/
	var width  =  600;
	var height = 700;

	
	var force = null;
	var colors = null;
	var svg = null;
	var drag_line = null;
	var path = null;
	var circle = null;
	var drag;
	/**************************************************************************
	 * ************************************************************************
	 * ************** 				CLASS METHODS 			*******************
	 * ************************************************************************
	 *************************************************************************/
    function getWidth(){
    	return width;
    }
    function getHeight(){
    	return height;
    }
    function getForce (){
    	return force ;
    }
    
    function dragstart(d) {
    	  d3.select(this).classed("fixed", d.fixed = true);
    	}
	// update graph (called when needed)
	function restart() {
		
	  listOfLinksInCurrentConfiguration = listOfLinks.filter(function(l) {	
		  return (l.onlineInConfigurationWithID == networkConfiguration[selected_configuration].id);
	  });
	  
	  listOfNodesInCurrentConfiguration = nodes.filter(function(n) {
		  return (n.listOfConfigurationWherePresent.indexOf(networkConfiguration[selected_configuration].id) != -1 );
	  });

	  path = path.data(listOfLinksInCurrentConfiguration);

	  // update existing listOfLinks
	  path.classed('selected', function(d) { return d === selected_link; })
	    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
	    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


	  // add new listOfLinks
	  path.enter().append('svg:path')
	    .attr('class', 'link')
	    .classed('selected', function(d) { return d === selected_link; })
	    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
	    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
	    .call(drag)
	    .on('mousedown', function(d) {
	      if(d3.event.ctrlKey) return;

	      // select link
	      mousedown_link = d;
	      if(mousedown_link === selected_link) selected_link = null;
	      else selected_link = mousedown_link;
	      selected_node = null;
	      restart();
	    });

	  // remove old listOfLinks
	  path.exit().remove();


	  // circle (node) group
	  // NB: the function arg is crucial here! nodes are known by id, not by index!
	  circle = circle.data(listOfNodesInCurrentConfiguration, function(d) { return d.id; });

	  // update existing nodes (reflexive & selected visual states)
	  //# d3.scale.category10() colors
	  circle.selectAll('circle')
	  	.style('fill', function(d) { return (d === selected_node) ? d3.rgb(d.color).brighter().toString() : d.color; })
	    .classed('reflexive', function(d) { return d.reflexive; });

	  // add new nodes
	  var g = circle.enter().append('svg:g');

	  g.append('svg:circle')
	    .attr('class', 'node')
	    .attr('r', 12)
	    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(d.color).brighter().toString() : d.color; })
	    .style('stroke', function(d) { return d3.rgb(d.color).darker().toString(); })
	    .classed('reflexive', function(d) { return d.reflexive; })
	    .on('mouseover', function(d) {
	      if(!mousedown_node || d === mousedown_node) return;
	      // enlarge target node
	      d3.select(this).attr('transform', 'scale(1.1)');
	    })
	    .on('mouseout', function(d) {
	      if(!mousedown_node || d === mousedown_node) return;
	      // unenlarge target node
	      d3.select(this).attr('transform', '');
	    })
	    .on('mousedown', function(d) {
	      if(d3.event.ctrlKey) return;

	      // select node
	      mousedown_node = d;
	      if(mousedown_node === selected_node) selected_node = null;
	      else selected_node = mousedown_node;
	      selected_link = null;

	      // reposition drag line
	      drag_line
	        .style('marker-end', 'url(#end-arrow)')
	        .classed('hidden', false)
	        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

	      restart();
	    })
	    .on('mouseup', function(d) {
	      if(!mousedown_node) return;

	      // needed by FF
	      drag_line
	        .classed('hidden', true)
	        .style('marker-end', '');

	      // check for drag-to-self
	      mouseup_node = d;
	      if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

	      // unenlarge target node
	      d3.select(this).attr('transform', '');
	      
	    var source, target, direction;

	      source = mousedown_node;
	      target = mouseup_node;
	      direction = 'right'; 

	    var link;
	    link = listOfLinks.filter(function(l) {
	      return (l.source === source && l.target === target && l.onlineInConfigurationWithID == networkConfiguration[selected_configuration].id);
	    })[0];

	    if(link) {
	      link[direction] = true;
	    } else {    	
	      link = {
	    		  id : ++lastLinkId, source: source, target: target, left: false, right: false, protocol: "TCP", 
	    		  bitRate : 10000, startTime : networkConfiguration[selected_configuration].start.getTime(), 
	    		  stopTime : networkConfiguration[selected_configuration].end.getTime(), delay : 2,
	    		  onlineInConfigurationWithID : networkConfiguration[selected_configuration].id
	      		};
	      link[direction] = true;
	      listOfLinks.push(link);
	      modifyConnection(link.id, "add");     

	    }
	      // select new link
	      selected_link = link;
	      selected_node = null;
	      restart();
	    });

	  // show node IDs
	  g.append('svg:text')
	      .attr('x', 0)
	      .attr('y', 4)
	      .attr('class', 'id')
	      .text(function(d) { return d.id; });

	  // remove old nodes
	  circle.exit().remove();

	  // set the graph in motion
	  force.start();
	  //n = nodes.length;
	  //for (var i = 0; i < n; ++i) force.tick();
	  //force.stop();
	}   
	
	// update force layout (called automatically each iteration)
	function tick() {
	  // draw directed edges with proper padding from node centers
	  path.attr('d', function(d) {
	    var deltaX = d.target.x - d.source.x,
	        deltaY = d.target.y - d.source.y,
	        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
	        normX = deltaX / dist,
	        normY = deltaY / dist,
	        sourcePadding = d.left ? 17 : 12,
	        targetPadding = d.right ? 17 : 12,
	        sourceX = d.source.x + (sourcePadding * normX),
	        sourceY = d.source.y + (sourcePadding * normY),
	        targetX = d.target.x - (targetPadding * normX),
	        targetY = d.target.y - (targetPadding * normY);
	    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
	  });

	  circle.attr('transform', function(d) {
	    return 'translate(' + d.x + ',' + d.y + ')';
	  });
	}
	
	


	function resetMouseVars() {
	  mousedown_node = null;
	  mouseup_node = null;
	  mousedown_link = null;
	}

	function mousedown() {
	  //d3.event.preventDefault();
	  // because :active only works in WebKit?
	  svg.classed('active', true);

	  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;
	  
	  // insert new node at point
	  showDialogAddNewNode(selected_configuration);

	}

	function mousemove() {
	  if(!mousedown_node) return;

	  // update drag line
	  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
	  force.stop();
	  //restart();
	}

	function mouseup() {
		
		displaySelectedNode();

	  if(mousedown_node) {
	    // hide drag line
	    drag_line
	      .classed('hidden', true)
	      .style('marker-end', '');
	  }

	  // because :active only works in WebKit?
	  svg.classed('active', false);

	  // clear mouse event vars
	  resetMouseVars();
	  
	  }
	function keydown() {
	  //d3.event.preventDefault();

	  if(lastKeyDown !== -1) return;
	  lastKeyDown = d3.event.keyCode;

	  // ctrl
	  if(d3.event.keyCode === 17) {
	    circle.call(getForce().drag);
	    svg.classed('ctrl', true);
	  }

	  if(!selected_node && !selected_link) return;
	  switch(d3.event.keyCode) {
	    case 8: // backspace
	    case 46: // delete
	      if(selected_node) {
	    	var indexOfPosition2splpice = 
	    		selected_node.listOfConfigurationWherePresent.indexOf(networkConfiguration[selected_configuration].id);
	      	selected_node.listOfConfigurationWherePresent.splice(indexOfPosition2splpice, 1);
	      	if (selected_node.listOfConfigurationWherePresent.length == 0){
	      		nodes.splice(nodes.indexOf(selected_node), 1);	
	      	}        
		  	  var toSplice = listOfLinks.filter(function(l) {
		  	    return ((l.source === selected_node || l.target === selected_node) && l.onlineInConfigurationWithID == networkConfiguration[selected_configuration].id );
		  	  });
		  	  toSplice.map(function(l) {
		  		modifyConnection(l.id, "deleteOnGraphBecauseNodeDeletion");   
		  	    listOfLinks.splice(listOfLinks.indexOf(l), 1);
		  	  });
	        
	      } else if(selected_link) {
	   		modifyConnection(selected_link.id, "deleteOnGraph");     
	        listOfLinks.splice(listOfLinks.indexOf(selected_link), 1);
	      }
	      $("#settingsBlock").empty();
	      selected_link = null;
	      selected_node = null;
	      restart();
	      break;
	    case 66: // B
	      if(selected_link) {
	        // set link direction to both left and right
	        selected_link.left = true;
	        selected_link.right = true;
	      }
	      restart();
	      break;
	    case 76: // L
	      if(selected_link) {
	        // set link direction to left only
	        selected_link.left = true;
	        selected_link.right = false;
	      }
	      restart();
	      break;
	    case 82: // R
	      if(selected_node) {
	        // toggle node reflexivity
	        selected_node.reflexive = !selected_node.reflexive;
	      } else if(selected_link) {
	        // set link direction to right only
	        selected_link.left = false;
	        selected_link.right = true;
	      }
	      restart();
	      break;
	  }
	}

	function keyup() {
	  lastKeyDown = -1;

	  // ctrl
	  if(d3.event.keyCode === 17) {
	    circle
	      .on('mousedown.drag', null)
	      .on('touchstart.drag', null);
	    svg.classed('ctrl', false);
	  }
	}	
	
	function init(){		
	
		width  = ($(document).width()/2) - 10 ;		 
		
		colors = d3.scale.category10();
		
		force = d3.layout.force()
		.nodes(nodes)
		.links(listOfLinks)
		.size([ getWidth(), getHeight()])
		.linkDistance(150)
		.charge(-500)
		.on('tick', tick);
		

		svg = d3.select('#graph')
		.append('svg')
		.attr('width', getWidth())
		.attr('height', getHeight());

		//define arrow markers for graph listOfLinks
		svg.append('svg:defs').append('svg:marker')
		 .attr('id', 'end-arrow')
		 .attr('viewBox', '0 -5 10 10')
		 .attr('refX', 6)
		 .attr('markerWidth', 3)
		 .attr('markerHeight', 3)
		 .attr('orient', 'auto')
		.append('svg:path')
		 .attr('d', 'M0,-5L10,0L0,5')
		 .attr('fill', '#000');

		svg.append('svg:defs').append('svg:marker')
		 .attr('id', 'start-arrow')
		 .attr('viewBox', '0 -5 10 10')
		 .attr('refX', 4)
		 .attr('markerWidth', 3)
		 .attr('markerHeight', 3)
		 .attr('orient', 'auto')
		.append('svg:path')
		 .attr('d', 'M10,-5L0,0L10,5')
		 .attr('fill', '#000');

		//line displayed when dragging new nodes
		drag_line = svg.append('svg:path')
		.attr('class', 'link dragline hidden')
		.attr('d', 'M0,0L0,0');

		//handles to link and node element groups
		path = svg.append('svg:g').selectAll('path');
		circle = svg.append('svg:g').selectAll('g');

		svg.on('mousedown', mousedown)
		  .on('mousemove', mousemove)
		  .on('mouseup', mouseup);
		d3.select(window)
		//svg
		  .on('keydown', keydown)
		  .on('keyup', keyup);	
		
		drag = force.drag()
	    .on("dragstart", dragstart);
		circle.call(force.drag);
		
	}
	function resetSelectedNode(){
		selected_node = null;
	}
	
    
    return {
    	restart : restart,
    	getWidth:getWidth,
    	getHeight:getHeight,
    	init : init,
    	getForce : getForce,
    	resetSelectedNode:resetSelectedNode
	};

})();
