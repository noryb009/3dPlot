var ALLOW_WEBGL = true;
//var ALLOW_WEBGL = false;
var AXIS_SIZE = 10;
var AXIS_TICK_SIZE = 0.5;
var AXIS_TICK_SPACING = 1;

var axisPositions = function() {
	"use strict";
	var posns = [
		[new THREE.Vector3(-AXIS_SIZE, 0, 0),
		 new THREE.Vector3( AXIS_SIZE, 0, 0),],
		[new THREE.Vector3(0, -AXIS_SIZE, 0),
		 new THREE.Vector3(0,  AXIS_SIZE, 0),],
		[new THREE.Vector3(0, 0, -AXIS_SIZE),
		 new THREE.Vector3(0, 0,  AXIS_SIZE),],
	];

	for(var i = -AXIS_SIZE; i <= AXIS_SIZE; i += AXIS_TICK_SPACING) {
		if(i === 0) continue;
		posns[0].push(
			new THREE.Vector3(i, 0, -AXIS_TICK_SIZE),
			new THREE.Vector3(i, 0,  AXIS_TICK_SIZE)
		);
		posns[1].push(
			new THREE.Vector3(-AXIS_TICK_SIZE, i, 0),
			new THREE.Vector3( AXIS_TICK_SIZE, i, 0)
		);
		posns[2].push(
			new THREE.Vector3(-AXIS_TICK_SIZE, 0, i),
			new THREE.Vector3( AXIS_TICK_SIZE, 0, i)
		);
	}
	return posns;
};

window.onload = function() {
	"use strict";
	u.init();

	var axisGeo = [new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry()];
	var posns = axisPositions();
	axisGeo[0].vertices = posns[0];
	axisGeo[1].vertices = posns[1];
	axisGeo[2].vertices = posns[2];
	var xMat = new THREE.LineBasicMaterial({
		color: 0xff0000,
		transparent: true,
		opacity: 0.5,
		depthWrite: false
	});
	var yMat = xMat.clone();
	var zMat = xMat.clone();
	yMat.setValues({color: 0x00ff00});
	zMat.setValues({color: 0x0000ff});

	u.addMesh(new THREE.Line(axisGeo[0], xMat, THREE.LinePieces));
	u.addMesh(new THREE.Line(axisGeo[1], yMat, THREE.LinePieces));
	u.addMesh(new THREE.Line(axisGeo[2], zMat, THREE.LinePieces));

	u.render();
};
