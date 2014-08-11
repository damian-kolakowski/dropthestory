/*
Copyright (c) 2014 Damian Kołakowski.
All rights reserved.

Redistribution and use in source and binary forms are permitted
provided that the above copyright notice and this paragraph are
duplicated in all such forms and that any documentation,
advertising materials, and other materials related to such
distribution and use acknowledge that the software was developed
by the Damian Kołakowski. The name of the
Damian Kołakowski may not be used to endorse or promote products derived
from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED ``AS IS'' AND WITHOUT ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
*/

function centerViewport(renderResult) {
	var wrapNode = renderResult.wrap;
	var domNodeToTransform = renderResult.root;
	var edgeMargin = 100;

	var boundsWidth = parseInt(domNodeToTransform.style.width, 10);
	var boundsHeight = parseInt(domNodeToTransform.style.height, 10);

	var scale = Math.min((wrapNode.offsetWidth-edgeMargin)/boundsWidth, (wrapNode.offsetHeight-edgeMargin)/boundsHeight);

	var scaledWidth = scale * boundsWidth;
	var scaledHeight = scale * boundsHeight;

	domNodeToTransform.style.left = (( wrapNode.offsetWidth - scaledWidth ) / 2 ) + 'px';
	domNodeToTransform.style.top  = (( wrapNode.offsetHeight - scaledHeight ) / 2 ) + 'px';

	domNodeToTransform.style.webkitTransform = 'scale(' + scale + ')';

	return scale;
}

function initViewportEditor(renderResult) {
	var domNodeToTransform = renderResult.root;
	var recentX, recentY;
	var scale = centerViewport(renderResult);
	window.addEventListener('mousedown', function(theEvent) {
		recentX = theEvent.screenX, recentY = theEvent.screenY;
		var mouseMoveFunc = function(theEvent) {
			var dX  = theEvent.screenX - recentX, dY = theEvent.screenY - recentY;
			recentX = theEvent.screenX;
			recentY = theEvent.screenY;
			domNodeToTransform.style.left = (parseInt(domNodeToTransform.style.left, 10) + dX) + 'px';
			domNodeToTransform.style.top = (parseInt(domNodeToTransform.style.top, 10) + dY) + 'px';
			theEvent.preventDefault();
			return false;
		};
		var mouseUpFunc = function(theEvent) {
			window.removeEventListener('mousemove', mouseMoveFunc, false);
			window.removeEventListener('mouseup', mouseUpFunc, false);
			theEvent.preventDefault();
			return false;
		};
		window.addEventListener('mouseup', mouseUpFunc, false);
		window.addEventListener('mousemove', mouseMoveFunc, false);
		return false;
	}, false);
	window.addEventListener('mousewheel', function(theEvent) {
		var e = window.event || e; 
		var wheelDelta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		var dS = wheelDelta / 20;
		var newScale = scale + dS;
		if ( newScale < 0.1 ) newScale = 0.06;
		if ( newScale > 10  ) newScale = 10;
		dS = newScale - scale;
		var left = parseInt(domNodeToTransform.style.left, 10);
		var top  = parseInt(domNodeToTransform.style.top, 10);
		left -= ( dS/scale ) * ( theEvent.pageX - left );
		top  -= ( dS/scale ) * ( theEvent.pageY - top );
		domNodeToTransform.style.left = left + 'px';
		domNodeToTransform.style.top  = top + 'px';
		scale = newScale;
		domNodeToTransform.style.webkitTransform = 'scale(' + scale + ')';
		theEvent.preventDefault();
		return false;
	}, false);
}

// ENTRY POINT

function dropTheStoryMain() {
	var dropArea = ui_div('drop', 'Drop storyboard here...');
	window.addEventListener('dragenter', doNothing, true);
	window.addEventListener('dragleave', doNothing, true);
	window.addEventListener('dragover', doNothing, true);
	window.addEventListener('drop', function(theEvent) {
		ui_body().removeChild(dropArea);
		var files = theEvent.dataTransfer.files;
		if  ( files && files.length > 0 ) {
			new StoryboardLoader().load(files[0], function(result) {
				var renderResult = new StoryboardRenderer().render(result);
				ui_body().appendChild(renderResult.wrap);
				initViewportEditor(renderResult);
			}, function(error) {
				console.log(error);
			});
		}
		theEvent.stopPropagation();
		theEvent.preventDefault();
		return false;
	}, true);
	ui_body().appendChild(dropArea);
}
