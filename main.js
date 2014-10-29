var ALLOW_WEBGL = true;
//var ALLOW_WEBGL = false;
var AXIS_SIZE = 10;
var AXIS_TICK_SIZE = 0.5;
var AXIS_TICK_SPACING = 1;

window.onload = function() {
	"use strict";
	u.init();
	u.addAxis();
	u.render();
};
