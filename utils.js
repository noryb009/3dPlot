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

ThreeJSUtils.prototype.createAxis = function(x, y, z, colour, dashed) {
	var geo = new THREE.Geometry();
	var mat;

	if(dashed) {
		mat = new THREE.LineDashedMaterial({
			dashSize: 0.5,
			gapSize:  0.5,
		});
	} else {
		mat = new THREE.LineBasicMaterial();
	}
	mat.setValues({
		color: colour,
		transparent: true,
		opacity: 0.5,
		depthWrite: false,
	});

	geo.vertices = [
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(x,y,z),
	];
	geo.computeLineDistances();

	return new THREE.Line(geo, mat, THREE.LinePieces);
};

ThreeJSUtils.prototype.addAxis = function() {
	"use strict";
	var axisObj = new THREE.Object3D();
	axisObj.add(this.createAxis( AXIS_SIZE,0,0, 0xff0000, false));
	axisObj.add(this.createAxis(-AXIS_SIZE,0,0, 0xff0000, true));
	axisObj.add(this.createAxis(0, AXIS_SIZE,0, 0x00ff00, false));
	axisObj.add(this.createAxis(0,-AXIS_SIZE,0, 0x00ff00, true));
	axisObj.add(this.createAxis(0,0, AXIS_SIZE, 0x0000ff, false));
	axisObj.add(this.createAxis(0,0,-AXIS_SIZE, 0x0000ff, true));

	this.addMesh(axisObj);
};

var u = new ThreeJSUtils();

