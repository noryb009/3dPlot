var ThreeJSUtils = function() {
	this.scene = null;
	this.camera = null;
	this.renderer = null;
	this.renderFlag = false;
	this.controls = null;
};

ThreeJSUtils.prototype.getElement = function() {
	return document.getElementById('canvasWrap');
};

ThreeJSUtils.prototype.init = function() {
	var w = this.getElement().offsetWidth;
	var h = window.innerHeight;

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
	this.camera.position.x = 5;
	this.camera.position.y = 5;
	this.camera.position.z = 5;

	if(ALLOW_WEBGL === true && window.WebGLRenderingContext)
		this.renderer = new THREE.WebGLRenderer();
	else
		this.renderer = new THREE.CanvasRenderer();

	this.renderer.setSize(w, h);
	this.renderer.setClearColor(0x000000, 1);
	this.getElement().appendChild(this.renderer.domElement);

	this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	this.controls.addEventListener('change', forceRender);
	this.controls.noPan = true;

	window.addEventListener('resize', onWinResize, false);
};

var onWinResize = function() {
	var w = u.getElement().offsetWidth;
	var h = window.innerHeight;

	u.renderer.setSize(w, h);

	u.camera.aspect = w / h;
	u.camera.updateProjectionMatrix();

	forceRender();
};

var forceRender = function() {
	u.renderFlag = false;
	u.renderer.render(u.scene, u.camera);
};

ThreeJSUtils.prototype.render = function() {
	if(this.renderFlag)
		return;
	this.renderFlag = true;
	requestAnimationFrame(forceRender);
};

ThreeJSUtils.prototype.addMesh = function(m) {
	if(m !== null && m !== undefined) {
		this.scene.add(m);
		this.render();
	}
};

ThreeJSUtils.prototype.removeMesh = function(m) {
	if(m !== null && m !== undefined) {
		this.scene.remove(m);
		this.render();
	}
};

var u = new ThreeJSUtils();
