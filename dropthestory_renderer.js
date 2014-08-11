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

function StoryboardRenderer() {

	function drawBezier(ctx, fromRect, toRect) {
		var middleX = (toRect.x - fromRect.x + fromRect.w)/4;
		var middleY = (toRect.y - fromRect.y + fromRect.h)/4;

		ctx.lineWidth = 2;
		ctx.strokeStyle = "#FFF";
		ctx.setLineDash([10, 10]);
		ctx.getLineDash();

		ctx.beginPath();
		ctx.moveTo(fromRect.x+fromRect.w, fromRect.y+fromRect.h/2);
		ctx.bezierCurveTo(fromRect.x+fromRect.w+middleX, fromRect.y+fromRect.h/2, toRect.x-middleX, toRect.y+toRect.h/2, toRect.x, toRect.y+toRect.h/2);
		ctx.stroke();

		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.fillStyle = "#FFF";
		ctx.moveTo(toRect.x, toRect.y+toRect.h/2);
		ctx.lineTo(toRect.x-15, toRect.y+toRect.h/2-10);
		ctx.lineTo(toRect.x-15, toRect.y+toRect.h/2+10);
		ctx.fill();
	}

	function processFrame(view, viewDOM) {
		if ( view.rect ) {
			viewDOM.style.left 		= view.rect[0].x + 'px';
			viewDOM.style.top  		= view.rect[0].y + 'px';
			viewDOM.style.width   	= view.rect[0].w + 'px';
			viewDOM.style.height  	= view.rect[0].h + 'px';
		}
	}

	function processCommon(view, viewDOM) {
		processFrame(view, viewDOM);
		if ( view.color ) {
			for ( var i = 0 ; i < view.color.length ; ++i ) {
				var color = view.color[i];
				if ( color.key == 'backgroundColor' ) {
					viewDOM.style.background = color.value;
				}
				if ( color.key == 'textColor' ) {
					viewDOM.style.color = color.value;
				}
			}
		}
		if ( view.fontDescription ) {
			for ( var i = 0 ; i < view.fontDescription.length ; ++i ) {
				var fontDesc = view.fontDescription[i];
				if ( fontDesc._key == 'fontDescription' ) {
					viewDOM.style.fontSize = fontDesc._pointSize + 'px';
				}
			}
		}
		if ( view._textAlignment ) viewDOM.style.textAlign = view._textAlignment;
	}

	function findColor(colors, colorName) {
		if ( colors ) {
			for ( var i = 0 ; i < colors.length ; ++i ) {
				var c = colors[i];
				if ( c.key == colorName ) return c.value;
			}
		}
	}

	var viewControllerFrames = {};
	var connectionsMap = [];
	var bounds = {};
	var lastViewController = {};
	var initialViewControllerId = {};

	var visitors = {
		visit_document: function(doc, parent, parentDom) { 
			initialViewControllerId = doc._initialViewController;
		},
		visit_scenes: function(scenes, parent, parentDom) { },
		visit_scene: function(scene, parent, parentDom) {
			var sceneDOM = ui_div('scene');
			if ( scene.point ) {
				sceneDOM.style.left = (-bounds.left + scene.point[0].x) + 'px';
				sceneDOM.style.top  = (-bounds.top + scene.point[0].y) + 'px';
				parentDom.appendChild(sceneDOM);
				return sceneDOM;
			}
		},
		visit_objects: function(objects, parent, parentDom) { },
		visit_subviews: function(objects, parent, parentDom) { },
		visit_view: function(view, parent, parentDom) {
			var viewDOM = ui_div('view');
			if ( view.rect ) {
				processCommon(view, viewDOM);
				parentDom.appendChild(viewDOM);
				return viewDOM;
			}
		},
		visit_label: function(label, parent, parentDom) { 
			var viewDOM = ui_div('view_label');
			viewDOM.innerHTML = label._text;
			if ( label.rect ) {
				processCommon(label, viewDOM);
				parentDom.appendChild(viewDOM);
				return viewDOM;
			}
		},
		visit_button: function(button, parent, parentDom) { 
			var viewDOM = ui_div('view_button');
			viewDOM.innerHTML = button._text;
			if ( button.rect ) {
				processCommon(button, viewDOM);
				if ( button.state ) {
					for ( var i = 0 ; i < button.state.length ; ++i ) {
						var state = button.state[i];
						if ( state._key == 'normal' ) {
							viewDOM.innerHTML = state._title;
							if ( state.color ) {
								viewDOM.style.color = state.color[0].value;
							}
						}
					}
				}
				if ( button.connections ) {
					if ( button.connections[0].segue ) {
						for ( var i = 0 ; i < button.connections[0].segue.length ; ++i ) {
							var s = button.connections[0].segue[i];
							connectionsMap.push({ to: s._destination, from: lastViewController._id });
						}
					}
				}
				parentDom.appendChild(viewDOM);
				return viewDOM;
			}
		},
		visit_containerView: function(view, parent, parentDom) {
			var viewDOM = ui_div('container_view');
			viewDOM.innerHTML = "Container View";
			if ( view.rect ) {
				processFrame(view, viewDOM);
				viewDOM.style.lineHeight = viewDOM.style.height;
				parentDom.appendChild(viewDOM);
				if ( view.connections ) {
					if ( view.connections[0].segue ) {
						for ( var i = 0 ; i < view.connections[0].segue.length ; ++i ) {
							var s = view.connections[0].segue[i];
							connectionsMap.push({ to: s._destination, from: lastViewController._id });
						}
					}
				}
				return viewDOM;
			}
			return viewDOM;
		},
		visit_imageView: function(view, parent, parentDom) { 
			var viewDOM = ui_div('view_image');
			if ( view.rect ) {
				var bgDom = ui_div('view_image_bg');
				var labelDom = ui_div('view_image_label');
				viewDOM.appendChild(bgDom);
				viewDOM.appendChild(labelDom);
				processFrame(view, viewDOM);
				labelDom.style.lineHeight 	= viewDOM.style.height;
				parentDom.appendChild(viewDOM);	
				if ( view._image ) {
					labelDom.innerHTML = view._image;
				} else {
					labelDom.innerHTML = 'UIImageView';
				}
				return viewDOM;
			}
		},
		visit_point: function(point, parent, parentDom) { },
		visit_navigationController: function(navigationController, parent, parentDom) {
			lastViewController = navigationController;
			var viewDOM = ui_div('navigation_controller');
			viewDOM.innerHTML 		= "Navigation Controller";
			viewDOM.style.left 		= '0px';
			viewDOM.style.top  		= '0px';
			viewDOM.style.width   	= '320px';
			viewDOM.style.height  	= '480px';
			viewDOM.style.lineHeight= viewDOM.style.height;
			var sceneX 	= parseInt(parentDom.style.left, 10);
			var sceneY 	= parseInt(parentDom.style.top, 10);
			viewControllerFrames[navigationController._id] = { x: sceneX, y: sceneY, w: 320, h: 480};
			if ( navigationController.connections ) {
				if ( navigationController.connections[0].segue ) {
					for ( var i = 0 ; i < navigationController.connections[0].segue.length ; ++i ) {
						var s = navigationController.connections[0].segue[i];
						connectionsMap.push({ to: s._destination, from: lastViewController._id });
					}
				}
			}
			parentDom.appendChild(viewDOM);
			return viewDOM;
		},
		visit_viewController: function(viewController, parent, parentDom) { 
			lastViewController = viewController;
			if ( viewController.view ) {
				if ( viewController.view[0].rect ) { 
					var rect 	= viewController.view[0].rect[0];
					var sceneX 	= parseInt(parentDom.style.left, 10);
					var sceneY 	= parseInt(parentDom.style.top, 10);
					viewControllerFrames[viewController._id] = { x: sceneX + rect.x, y: sceneY + rect.y, w: rect.w, h: rect.h };
				} 
			}
			if ( viewController.connections ) {
				if ( viewController.connections[0].segue ) {
					for ( var i = 0 ; i < viewController.connections[0].segue.length ; ++i ) {
						var s = viewController.connections[0].segue[i];
						connectionsMap.push({ to: s._destination, from: viewController._id });
					}
				}
			}
		},
		visit_textField: function(view, parent, parentDom) {
			var viewDOM = ui_div('view_text_field');
			if ( view.rect ) {
				processCommon(view, viewDOM);
				if ( view._borderStyle ) viewDOM.classList.add('border_style_' + view._borderStyle);
				if ( view._placeholder ) viewDOM.innerHTML = view._placeholder;
				if ( view._text ) viewDOM.innerHTML = view._text;
				parentDom.appendChild(viewDOM);
				return viewDOM;
			}
		},
		visit_scrollView: function(scroll, parent, parentDom) { 
			var viewDOM = ui_div('view_scroll');
			if ( scroll.rect ) {
				processCommon(scroll, viewDOM);
				parentDom.appendChild(viewDOM);
				return viewDOM;
			}
		},
		visit_segmentedControl: function(segment, parent, parentDom) {
			var viewDOM = ui_div('view_segment');
			if ( segment.rect ) {
				var tintColor = findColor(segment.color, 'tintColor');
				viewDOM.style.border = '1px solid ' + tintColor;
				processCommon(segment, viewDOM);
				if ( segment.segments ) {
					var segments  = segment.segments[0];
					if ( segments.segment ) {
						var segmentWidth = (segment.rect[0].w/segments.segment.length);
						for ( var i = 0 ; i < segments.segment.length ; ++i ) {
							var segmentChild = ui_div('view_segment_child', segments.segment[i]._title);
							segmentChild.style.width = segmentWidth + 'px';
							segmentChild.style.height = segment.rect[0].h + 'px';
							segmentChild.style.top = '-1px';
							segmentChild.style.left  = ( i * segmentWidth - 1) + 'px';
							if ( i < segments.segment.length - 1 ) {
								segmentChild.style.borderRight = viewDOM.style.border;
							} else {
								segmentChild.style.borderRight = '1px solid transparent';
							}
							segmentChild.style.lineHeight = segmentChild.style.height;
							segmentChild.style.color = tintColor;
							viewDOM.appendChild(segmentChild);
						}
					}
				}
				parentDom.appendChild(viewDOM);
				return viewDOM;
			}
		},
		visit_tableView: function(tableView, parent, parentDom) {
			var viewDOM = ui_div('view_table');
			viewDOM.innerHTML = 'Table View<br><small>Prototype Content</small>';
			if ( tableView.rect ) {
				processCommon(tableView, viewDOM);
				parentDom.appendChild(viewDOM);
				return viewDOM;
			}
		},
		visit_connections: function(connections, parent, parentDom) { },
		visit_segue: function(segue, parent, parentDom) {  }
	}

	function drawConnections(storyboardDOM) {
		var canvasDOM = document.createElement('canvas');
		canvasDOM.setAttribute('class', 'canvas');
		canvasDOM.setAttribute('width', parseInt(storyboardDOM.style.width, 10));
		canvasDOM.setAttribute('height', parseInt(storyboardDOM.style.height, 10));
		var ctx = canvasDOM.getContext('2d');
		storyboardDOM.insertBefore(canvasDOM, storyboardDOM.firstChild);
		for ( var i = 0 ; i < connectionsMap.length ; ++i ) {
			var fromRect = viewControllerFrames[connectionsMap[i].from];
			var toRect = viewControllerFrames[connectionsMap[i].to];
			drawBezier(ctx, fromRect, toRect);
		}
		var initialRect = viewControllerFrames[initialViewControllerId];
		if ( initialRect ) {
			var startDOM = ui_div('view_start', 'START');
			startDOM.style.top = (initialRect.y + initialRect.h/2) + 'px';
			startDOM.style.left = (initialRect.x - 150 ) + 'px';
			storyboardDOM.appendChild(startDOM);
			var rect = { x: initialRect.x - 150, y: initialRect.y, w: 0, h: initialRect.h };
			console.log(rect);
			drawBezier(ctx, { x: initialRect.x - 150, y: initialRect.y, w: 0, h: initialRect.h }, initialRect);
		}
	}

	function visit(object, visitors, parentDom) {
		for ( var property in object ) {
			if ( object.hasOwnProperty(property) ) {	
				var propertyValue = object[property];
				var visitFunc = visitors['visit_' + property];
				if ( visitFunc ) {
					if ( Array.isArray(propertyValue) ) for ( var i = 0 ; i < propertyValue.length ; ++i ) {
						var dom = visitFunc(propertyValue[i], visitors, parentDom);
						visit(propertyValue[i], visitors, dom ? dom : parentDom);
					}
				}
			}
		}
	}

	return { 
		render: function(storyboard) {
			var storyboardDOM = ui_div('storyboard');

			storyboardDOM.style.left 	= '0px';
			storyboardDOM.style.top 	= '0px';
			storyboardDOM.style.width 	= (storyboard.bounds.right - storyboard.bounds.left) + 'px';
			storyboardDOM.style.height 	= (storyboard.bounds.bottom - storyboard.bounds.top) + 'px';

			var storyboardWrapDOM = ui_div('storyboardWrap');
			storyboardWrapDOM.appendChild(storyboardDOM);

			viewControllerFrames = {};
			connectionsMap = [];
			bounds = storyboard.bounds;
			visit(storyboard, visitors, storyboardDOM);	
			drawConnections(storyboardDOM);

			return { wrap: storyboardWrapDOM, root: storyboardDOM };
		}
	}
}