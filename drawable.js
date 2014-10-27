var PT_SIZE = 0.25;
var LINE_SIZE = 5;
var PLANE_SIZE = 10;

var randomColour = (function() {
	var n = 0;
	return function() {
		var hue = (n * 137) % 360;
		n++;

		var sat = Math.floor(Math.random() * 50) + 50;
		var val = Math.floor(Math.random() * 50) + 50;

		var a = new tinycolor({h: hue, s: sat, v: val});
		return a.toString('hex');
	};
})();

function Vec(normalized) {
	var self = this;
	self.x = ko.observable(0);
	self.y = ko.observable(0);
	self.z = ko.observable(0);

	self.normalized = (typeof normalized !== 'undefined' ? normalized : false);

	self.v = ko.pureComputed(function(){
		if(!isNaN(parseFloat(self.x())) && isFinite(self.x()) &&
		   !isNaN(parseFloat(self.y())) && isFinite(self.y()) &&
		   !isNaN(parseFloat(self.z())) && isFinite(self.z())) {
			var v = new THREE.Vector3(parseFloat(self.x()), parseFloat(self.y()), parseFloat(self.z()));
			if(self.normalized) {
				if(v.length() === 0)
					return null;
				v.normalize();
			}
			return v;
		} else {
			return null;
		}
	});
}

function drawableModel(type, subtype, pts) {
	var self = this;

	self.type = ko.observable(type);
	self.subtype = ko.observable(subtype);
	self.colour = ko.observable(randomColour());
	self.pts = pts;

	self.geo = null;
	self.mesh = null;

	self.mat = ko.pureComputed(function() {
		switch(self.type()) {
			case 'point':
			case 'line':
				return new THREE.LineBasicMaterial({color: self.colour()});
				break;
			case 'plane':
				return new THREE.MeshBasicMaterial({
					color: self.colour(),
					side: THREE.DoubleSide,
					transparent: true,
					opacity: 0.5,
					depthWrite: false
				});
		}
	});

	self.linesAcrossPoint = function(v) {
		return [v.clone().setX(v.x-PT_SIZE),
			v.clone().setX(v.x+PT_SIZE),
			v.clone().setY(v.y-PT_SIZE),
			v.clone().setY(v.y+PT_SIZE),
			v.clone().setZ(v.z-PT_SIZE),
			v.clone().setZ(v.z+PT_SIZE)];
	}

	self.makePoint = function() {
		self.geo = new THREE.Geometry();
		self.geo.vertices =
			self.linesAcrossPoint(self.pts.p.v());

		self.mesh = new THREE.Line(self.geo, self.mat(), THREE.LinePieces);
	};

	self.makeLine = function() {
		if(self.pts.d.v().length() === 0)
			return;

		self.geo = new THREE.Geometry();
		self.geo.vertices.push(
			self.pts.d.v().clone().negate()
				.multiplyScalar(LINE_SIZE).add(self.pts.p.v()),
			self.pts.d.v().clone()
				.multiplyScalar(LINE_SIZE).add(self.pts.p.v())
		);

		self.mesh = new THREE.Line(self.geo, self.mat());
	};

	self.makePlane = function() {
		if(self.pts.n.v().length() === 0)
			return;

		self.geo = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
		self.mesh = new THREE.Mesh(
			self.geo, self.mat());
		self.mesh.position.copy(self.pts.p.v());
		self.mesh.lookAt(self.pts.p.v().clone()
			.add(self.pts.n.v()));
	};

	self.valid = ko.pureComputed(function() {
		for(var i in self.pts) {
			if(self.pts[i].v() === null) {
				return false;
			}
		}
		return true;
	});

	self.nothing = ko.computed(function() {
		u.removeMesh(self.mesh);
		self.mesh = null;

		if(self.valid() === false)
			return;
		
		switch(self.type()) {
			case 'point':
				self.makePoint();
				break;
			case 'line':
				self.makeLine();
				break;
			case 'plane':
				self.makePlane();
				break;
		}

		u.addMesh(self.mesh);
	});

	self.remove = function() {
		u.removeMesh(self.mesh);
	}
}	

function drawableModels(){
	var self = this;
	self.items = ko.observableArray();

	self.filterByType = function(arr, type, subtype) {
		return ko.utils.arrayFilter(arr,
			function(val) {
				return val.type() === type &&
					(subtype === null ||
					 val.subtype() === subtype);
			}
		);
	}

	self.addPoint = function() {
		self.items.push(new drawableModel('point', '',
		{
			p: new Vec()
		}));
	};

	self.addLine = function() {
		self.items.push(new drawableModel('line', '',
		{
			p: new Vec(),
			d: new Vec(true)
		}));
	};

	self.addPlane = function() {
		self.items.push(new drawableModel('plane', '',
		{
			p: new Vec(),
			n: new Vec(true)
		}));
	};

	self.getType = function(type, subtype) {
		return self.filterByType(self.items(), type, subtype);
	};

	self.remove = function(item) {
		item.remove();
		self.items.remove(item);
	};
}

var models = new drawableModels();
ko.applyBindings(models);
