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

function ui_body()					{ return document.getElementsByTagName('body')[0]; }
function ui_div(clazz, text)		{ var elem = document.createElement('div'); elem.setAttribute('class', clazz); if ( text ) elem.innerHTML = text; return elem; }
function ui_table(clazz, text)		{ var elem = document.createElement('table'); elem.setAttribute('class', clazz); return elem; }
function ui_td(clazz, text)			{ var elem = document.createElement('td'); elem.setAttribute('class', clazz); if ( text ) elem.innerHTML = text; return elem; }
function ui_tr(clazz)				{ var elem = document.createElement('tr'); elem.setAttribute('class', clazz); return elem; }
function ui_a_blank(clazz)			{ var elem = document.createElement('a'); elem.setAttribute('class', clazz); elem.setAttribute('target', '_blank'); return elem; }
function ui_img(clazz, src)			{ var elem = document.createElement('img'); elem.setAttribute('class', clazz); if ( src ) elem.setAttribute('src', src); return elem; }
function ui_clean(n)				{ while ( n.firstNode ) { n.removeChild(n.firstNode); } }
function ui_by_id(identifier)		{ return document.getElementById(identifier); };
function ui_frame(n, x, y, w, h)	{ n.style.width = w + 'px'; n.style.height = h + 'px'; n.style.left = x + 'px'; n.style.top = y + 'px'; }
function doNothing(theEvent)		{ theEvent.stopPropagation(); theEvent.preventDefault(); return false; }

