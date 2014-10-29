var ALLOW_WEBGL = true;
//var ALLOW_WEBGL = false;
var AXIS_SIZE = 10;
var AXIS_TICK_SIZE = 0.5;
var AXIS_TICK_SPACING = 1;

var axisPositions = function() {
	"use strict";
	var posns = [
		new THREE.Vector3(-AXIS_SIZE, 0, 0),
		new THREE.Vector3( AXIS_SIZE, 0, 0),
		new THREE.Vector3(0, -AXIS_SIZE, 0),
		new THREE.Vector3(0,  AXIS_SIZE, 0),
		new THREE.Vector3(0, 0, -AXIS_SIZE),
		new THREE.Vector3(0, 0,  AXIS_SIZE),
	];

	for(var i = -AXIS_SIZE; i <= AXIS_SIZE; i += AXIS_TICK_SPACING) {
		if(i === 0) continue;
		posns.push(
			new THREE.Vector3(i, 0, -AXIS_TICK_SIZE),
			new THREE.Vector3(i, 0,  AXIS_TICK_SIZE),
			new THREE.Vector3(-AXIS_TICK_SIZE, i, 0),
			new THREE.Vector3( AXIS_TICK_SIZE, i, 0),
			new THREE.Vector3(-AXIS_TICK_SIZE, 0, i),
			new THREE.Vector3( AXIS_TICK_SIZE, 0, i)
		);
	}
	return posns;
};

window.onload = function() {
	"use strict";
	u.init();

	var axisGeo = new THREE.Geometry();
	axisGeo.vertices = axisPositions();
	var axisMat = new THREE.LineBasicMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: 0.5,
		depthWrite: false
	});
	var axisMesh = new THREE.Line(axisGeo, axisMat, THREE.LinePieces);

	u.addMesh(axisMesh);

	u.render();
};
