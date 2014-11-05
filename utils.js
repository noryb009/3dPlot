var ThreeJSUtils = function() {
	"use strict";
	this.scene = null;
	this.camera = null;
	this.renderer = null;
	this.renderFlag = false;
	this.controls = null;
};

ThreeJSUtils.prototype.getElement = function() {
	"use strict";
	return document.getElementById('canvasWrap');
};

ThreeJSUtils.prototype.init = function() {
	"use strict";
	var w = this.getElement().offsetWidth;
	var h = window.innerHeight;

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
	this.camera.position.x = 3;
	this.camera.position.y = 3;
	this.camera.position.z = 10;

	try {
		if(ALLOW_WEBGL === false || !window.WebGLRenderingContext)
			throw "WebGL Not Supported"
		this.renderer = new THREE.WebGLRenderer();
	} catch(e) {
		this.renderer = new THREE.CanvasRenderer();
	}

	this.renderer.setSize(w, h);
	this.renderer.setClearColor(0x000000, 1);
	this.getElement().appendChild(this.renderer.domElement);

	this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	this.controls.addEventListener('change', forceRender);
	this.controls.noPan = true;

	window.addEventListener('resize', onWinResize, false);
};

var onWinResize = function() {
	"use strict";
	var w = u.getElement().offsetWidth;
	var h = window.innerHeight;

	u.renderer.setSize(w, h);

	u.camera.aspect = w / h;
	u.camera.updateProjectionMatrix();

	forceRender();
};

var forceRender = function() {
	"use strict";
	u.renderFlag = false;
	u.renderer.render(u.scene, u.camera);
};

ThreeJSUtils.prototype.render = function() {
	"use strict";
	if(this.renderFlag)
		return;
	this.renderFlag = true;
	requestAnimationFrame(forceRender);
};

ThreeJSUtils.prototype.addMesh = function(m) {
	"use strict";
	if(m !== null && m !== undefined) {
		this.scene.add(m);
		this.render();
	}
};

ThreeJSUtils.prototype.removeMesh = function(m) {
	"use strict";
	if(m !== null && m !== undefined) {
		this.scene.remove(m);
		this.render();
	}
};

ThreeJSUtils.prototype.axisPositions = function() {
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


ThreeJSUtils.prototype.addAxis = function() {
	"use strict";
	var axisGeo = [new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry()];
	var posns = this.axisPositions();
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

	this.addMesh(new THREE.Line(axisGeo[0], xMat, THREE.LinePieces));
	this.addMesh(new THREE.Line(axisGeo[1], yMat, THREE.LinePieces));
	this.addMesh(new THREE.Line(axisGeo[2], zMat, THREE.LinePieces));
};

var u = new ThreeJSUtils();

