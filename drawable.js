var PT_SIZE = 0.25;
var LINE_SIZE = 5;
var PLANE_SIZE = 5;
var LINE_WIDTH = 2;
var PLANE_OPACITY = 0.5;
var ZERO_VECTOR = new THREE.Vector3(0,0,0);

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

function drawableModel(type, subtype, size, pts) {
    var self = this;

    self.collapse = ko.observable(false);
    self.type = ko.observable(type);
    self.subtype = ko.observable(subtype);
    self.size = ko.observable(size);
    self.colour = ko.observable(randomColour());
    self.opacity = ko.observable(PLANE_OPACITY);
    self.pts = pts;

    self.geo = null;
    self.mesh = null;

    self.toggleCollapse = function() {
        self.collapse(!self.collapse());
    };

    self.mat = ko.pureComputed(function() {
        switch(self.type()) {
            case 'point':
            case 'line':
                return new THREE.LineBasicMaterial({
                    color: self.colour(),
                    linewidth: LINE_WIDTH
                });
                break;
            case 'plane':
                return new THREE.MeshBasicMaterial({
                    color: self.colour(),
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: self.opacity(),
                    depthWrite: (parseFloat(self.opacity()) === 1.0)
                });
        }
    });

    self.linesAcrossPoint = function(v) {
        return [v.clone().setX(v.x-self.size()),
            v.clone().setX(v.x+self.size()),
            v.clone().setY(v.y-self.size()),
            v.clone().setY(v.y+self.size()),
            v.clone().setZ(v.z-self.size()),
            v.clone().setZ(v.z+self.size())];
    }

    self.makePoint = function() {
        self.geo = new THREE.Geometry();

        self.geo.vertices =
            self.linesAcrossPoint(self.pts.p.v());

        if(self.subtype() === 'vector')
            self.geo.vertices.push(self.pts.p.v(), ZERO_VECTOR);

        self.mesh = new THREE.Line(self.geo, self.mat(), THREE.LinePieces);
    };

    self.makeLine = function() {
        if(self.pts.d.v().length() === 0)
            return;

        self.geo = new THREE.Geometry();
        self.geo.vertices.push(
            self.pts.d.v().clone().negate()
                .multiplyScalar(self.size()).add(self.pts.p.v()),
            self.pts.d.v().clone()
                .multiplyScalar(self.size()).add(self.pts.p.v())
        );

        self.mesh = new THREE.Line(self.geo, self.mat());
    };

    self.makePlane = function() {
        var normal;
        if(self.subtype() === 'normal') {
            if(self.pts.n.v().length() === 0)
                return;
            normal = self.pts.n.v();
        } else {
            if(self.pts.d1.v().length() === 0 ||
               self.pts.d2.v().length() === 0)
                return;
            normal = self.pts.d1.v().clone().cross(self.pts.d2.v());
            if(normal.length() === 0)
                return;
        }

        self.geo = new THREE.PlaneGeometry(self.size() * 2, self.size() * 2);
        self.mesh = new THREE.Mesh(
            self.geo, self.mat());
        self.mesh.position.copy(self.pts.p.v());
        self.mesh.lookAt(self.pts.p.v().clone()
            .add(normal));
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

    self.prettyType = ko.pureComputed(function() {
        return self.type().charAt(0).toUpperCase()
            + self.type().substring(1);
    });

    self.itemTemplate = ko.pureComputed(function() {
        var t = 'item-template-';
        switch(self.type()) {
            case 'point':
                return t+'point';
            case 'line':
                if(self.subtype() === 'parametric')
                    return t+'line-parametric';
                return t+'line';
            case 'plane':
                if(self.subtype() === 'normal')
                    return t+'plane-normal';
                return t+'plane';
        }
    });
}

function drawableModels(){
    var self = this;
    self.items = ko.observableArray();

    self.addPoint = function(subtype) {
        self.items.push(new drawableModel('point', subtype, PT_SIZE,
        {
            p: new Vec()
        }));
    };

    self.addLine = function(subtype) {
        self.items.push(new drawableModel('line', subtype, LINE_SIZE,
        {
            p: new Vec(),
            d: new Vec(true)
        }));
    };

    self.addPlane = function(subtype) {
        var pts;
        if(subtype === 'normal')
            pts = {
                p: new Vec(),
                n: new Vec()
            };
        else
            pts = {
                p: new Vec(),
                d1: new Vec(),
                d2: new Vec()
            };
        self.items.push(new drawableModel('plane', subtype, PLANE_SIZE, pts));
    };
    self.addObject = function() {
        var element = document.getElementById('add-select');
        switch(element.value) {
            case 'pt':
                self.addPoint('');
                break;
            case 'pt-vector':
                self.addPoint('vector');
                break;
            case 'line':
                self.addLine('');
                break;
            case 'line-para':
                self.addLine('parametric');
                break;
            case 'plane':
                self.addPlane('');
                break;
            case 'plane-normal':
                self.addPlane('normal');
                break;
        }
        element.value = '';
    };

    self.remove = function(item) {
        item.remove();
        self.items.remove(item);
    };
}

var models = new drawableModels();
ko.applyBindings(models);
