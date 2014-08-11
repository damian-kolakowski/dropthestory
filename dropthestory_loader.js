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

function StoryboardLoader() {	

	var customColorSpaceConverters = {
		calibratedWhite: function(node) {
			var W = Math.round(parseFloat(node.getAttribute('white')) * 255.0);
			var A = parseFloat(node.getAttribute('alpha'));
			var key = node.getAttribute('key');
			return { value: 'rgba('+W+','+W+','+W+','+A+')', key: key };
		},
		calibratedRGB: function(node) {
			var R = Math.round(parseFloat(node.getAttribute('red')) * 255.0);
			var G = Math.round(parseFloat(node.getAttribute('green')) * 255.0);
			var B = Math.round(parseFloat(node.getAttribute('blue')) * 255.0);
			var A = parseFloat(node.getAttribute('alpha'));
			var key = node.getAttribute('key');
			return { value: 'rgba('+R+','+G+','+B+','+A+')', key: key };
		}
	}

	var colorConverters = {
		calibratedRGB: customColorSpaceConverters.calibratedRGB,
		deviceRGB: customColorSpaceConverters.calibratedRGB,
		calibratedWhite: customColorSpaceConverters.calibratedWhite,
		custom: function(node) {
			var customColorSpaceName = node.getAttribute('customColorSpace');
			if ( customColorSpaceName ) {
				var customColorSpaceConverter = customColorSpaceConverters[customColorSpaceName];
				if ( customColorSpaceConverter ) {
					return customColorSpaceConverter(node);
				}
			}
			return node;
		}
	}

	var customNodesConverters = {
		rect: function(node) { return {
			x: parseInt(node.getAttribute('x')),
			y: parseInt(node.getAttribute('y')),
			w: parseInt(node.getAttribute('width')),
			h: parseInt(node.getAttribute('height'))
		}},
		point: function(node) { return {
			x: parseInt(node.getAttribute('x')),
			y: parseInt(node.getAttribute('y'))
		}},
		color: function(node) {
			var colorSpace = node.getAttribute('colorSpace');
			if ( colorSpace ) {
				var colorConverter = colorConverters[colorSpace];
				if ( colorConverter ) {
					return colorConverter(node);
				}
			}
			return node;
		}
	}

	function xmlToJson(node) {
		var obj = {};
		if ( node.nodeType == Node.ELEMENT_NODE ) {
			var customConverter = customNodesConverters[node.nodeName];
			if ( customConverter ) {
				return customConverter(node);
			}
			for ( var j = 0; j < node.attributes.length; j++ ) {
				var attribute = node.attributes.item(j);
				obj['_'+attribute.nodeName] = attribute.nodeValue;
			}
		}
		if ( node.hasChildNodes() ) {
			for ( var i = 0; i < node.childNodes.length; i++ ) {
				var item = node.childNodes.item(i);
				if ( item.nodeType != Node.ELEMENT_NODE ) {
					continue;
				}
				var nodeName = item.nodeName;
				if ( typeof(obj[nodeName]) == "undefined" ) {
					obj[nodeName] = [];
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
		return obj;
	}

	function calculateBounds(storyboard) {
		var minX = 0, maxX = 0, minY = 0, maxY = 0, x, y;
		if ( storyboard && storyboard.document && storyboard.document[0].scenes && storyboard.document[0].scenes[0].scene ) {
			for ( var i = 0 ; i < storyboard.document[0].scenes[0].scene.length ; ++i ) {
				var scene = storyboard.document[0].scenes[0].scene[i];
				if ( scene.point && scene.objects && scene.objects[0].viewController && 
					scene.objects[0].viewController[0].view && 
					scene.objects[0].viewController[0].view[0].rect ) {
					var rect 	= scene.objects[0].viewController[0].view[0].rect[0];
					var left 	= scene.point[0].x + rect.x;
					var top  	= scene.point[0].y + rect.y;
					var right  	= left + rect.w;
					var bottom 	= top  + rect.h;
					if ( right 	> maxX ) maxX = right;
					if ( left 	< minX ) minX = left;
					if ( bottom > maxY ) maxY = bottom;
					if ( top 	< minY ) minY = top;			
				}		
			}
		}
		return { left: minX, top: minY, right: maxX, bottom: maxY };
	}

	var loadFunc = function(file, successCallback, errorCallback) {
		var reader = new FileReader();
		reader.onload = function(e) {
		  	var parser = new DOMParser();
	    	xmlDoc = parser.parseFromString(e.target.result,"text/xml");
	    	// error handling according to http://www.w3schools.com/dom/dom_errors_crossbrowser.asp
	    	if ( xmlDoc.documentElement.nodeName == "parsererror" ) {
	    		var errStr = xmlDoc.documentElement.childNodes[0].nodeValue;
  				errStr = errStr.replace(/</g, "&lt;");
	    		errorCallback(errStr);
	    		return;
	    	}
	    	pluginNode = xmlDoc.querySelector('document[type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB"]');
	    	if ( pluginNode ) {
	    		var result = xmlToJson(xmlDoc);
	    		result.bounds = calculateBounds(result);
	    		successCallback(result);
	    	} else {
	    		errorCallback("Can't load " + file.name + ': Invalid document type.')
	    	}
		};
		reader.readAsText(file);
	}

	return {
		load: loadFunc
	}
} 