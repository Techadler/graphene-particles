var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// Copyright 2016-2017 AdlerTech
var Graphene;
(function (Graphene) {
    var Config = /** @class */ (function () {
        function Config() {
            // Performance
            this.AutoAdjustAtomCount = true;
            this.Density = 0.5;
            this.MaxAtoms = 200;
            this.MaxLinkLength = 150;
            this.MaxLinksPerAtom = 0;
            // Renderer
            this.AlphaBackground = false;
            this.DrawLinks = true;
            this.DrawQuadTree = false;
            this.LinkWidth = 1.5;
            this.AtomMinSize = 4;
            this.AtomMaxSize = 8;
            this.MaxFPS = 60;
            // Colors
            this.BackgroundColor = undefined;
            this.LinkColor = undefined;
            this.AtomColor = undefined;
            this.AtomBorderColor = undefined;
            // Dimensions
            this.Height = 0;
            this.Width = 0;
            this.MaxHeight = 0;
            this.MaxWidth = 0;
            this.UserInterface = true;
            // Physics
            this.TPS = 60;
            this.ElectricalForce = 0; // electrical force constant, acts between atoms. (1000 is a good value)
            this.Gravity = { X: 0, Y: 0 }; // Applies force to all atoms
            this.AtomCollisions = true;
            this.WallCollisions = true;
            this.WallFriction = 0.9; // How much energy is preserved when bouncing atoms at walls
            this.AtomFriction = 0.9; // How much energy is preserved when colliding atoms
        }
        Config.parse = function (config) {
            var c = new Config();
            console.log('Parsing config: ' + JSON.stringify(config));
            // tslint:disable-next-line:forin
            for (var key in c) {
                if (c.hasOwnProperty(key) && config[key] != null) {
                    var value = config[key];
                    if (key === 'AtomColor') {
                        if (value.constructor === Array.constructor) {
                            c[key] = value;
                        }
                        else {
                            c[key] = [value];
                        }
                    }
                    else {
                        console.log('Setting value ' + key + ' : ' + value);
                        c[key] = value;
                    }
                }
            }
            return c;
        };
        return Config;
    }());
    Graphene.Config = Config;
})(Graphene || (Graphene = {}));
// Copyright 2017 AdlerTech
var Graphene;
(function (Graphene) {
    var RECORD_LENGTH = 1000;
    var TIME_SECOND = 1000;
    var DROP_THRESHOLD = 5 * TIME_SECOND;
    var AVERAGE_LENGTH = 100; // The samples over which to accumulate the average
    var Control = /** @class */ (function () {
        function Control() {
            this._frameTimes = new Array(RECORD_LENGTH);
            this._frameTimesIdx = 0;
            this._frameCount = 0;
            this._physicsTimes = new Array(RECORD_LENGTH);
            this._physicsTimesIdx = 0;
            this._physicsCount = 0;
            this._frameStart = 0;
            this._physicsStart = 0;
        }
        Control.prototype.onFrameStart = function () {
            this._frameStart = window.performance.now();
        };
        Control.prototype.onFrameStop = function () {
            var now = window.performance.now();
            var duration = now - this._frameStart;
            if (this._frameStart > 0 && duration < DROP_THRESHOLD) {
                this._frameCount++;
                this._frameTimesIdx = ++this._frameTimesIdx < RECORD_LENGTH ? this._frameTimesIdx : 0;
                this._frameTimes[this._frameTimesIdx] = duration;
            }
        };
        Control.prototype.onPhysicsStart = function () {
            this._physicsStart = window.performance.now();
        };
        Control.prototype.onPhysicsStop = function () {
            var now = window.performance.now();
            var duration = now - this._physicsStart;
            if (this._physicsStart > 0 && duration < DROP_THRESHOLD) {
                this._physicsCount++;
                this._physicsTimesIdx = ++this._physicsTimesIdx < RECORD_LENGTH ? this._physicsTimesIdx : 0;
                this._physicsTimes[this._physicsTimesIdx] = duration;
            }
        };
        Control.prototype.onRenderStart = function () {
        };
        Control.prototype.onRenderStop = function () {
        };
        Object.defineProperty(Control.prototype, "AveragePhysicsTime", {
            get: function () {
                var time = 0;
                var times = 0;
                for (var i = 0; i < 5; ++i) {
                    var idx = this._physicsTimesIdx - i;
                    if (idx < 0) {
                        idx = RECORD_LENGTH - idx;
                    }
                    var t = this._physicsTimes[idx];
                    if (t != null && t > 0) {
                        times++;
                        time += t;
                    }
                }
                if (times > 0) {
                    return time / times;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Control.prototype, "AverageFrameTime", {
            get: function () {
                var time = 0;
                var times = 0;
                for (var i = 0; i < 5; ++i) {
                    var idx = this._frameTimesIdx - i;
                    if (idx < 0) {
                        idx = RECORD_LENGTH - idx;
                    }
                    var t = this._frameTimes[idx];
                    if (t != null && t > 0) {
                        times++;
                        time += t;
                    }
                }
                if (times > 0) {
                    return time / times;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Control.prototype, "LastFrameTime", {
            get: function () {
                return this._frameTimes[this._frameTimesIdx];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Control.prototype, "LastPhysicsTime", {
            get: function () {
                return this._physicsTimes[this._physicsTimesIdx];
            },
            enumerable: true,
            configurable: true
        });
        return Control;
    }());
    Graphene.Control = Control;
})(Graphene || (Graphene = {}));
// Copyright 2016-2017 AdlerTech
var Graphene;
(function (Graphene) {
    var InstanceManager = /** @class */ (function () {
        function InstanceManager() {
        }
        InstanceManager.createInstance = function (canvas, config, useroverlay) {
            if (useroverlay === void 0) { useroverlay = null; }
            console.log('Creating instance...');
            var i = new Graphene.Instance(this.generateId(), canvas, config, useroverlay);
            this._instances.push(i);
            return i;
        };
        InstanceManager.generateId = function () {
            return '1'; // TODO
        };
        InstanceManager._instances = new Array();
        return InstanceManager;
    }());
    Graphene.InstanceManager = InstanceManager;
})(Graphene || (Graphene = {}));
// Copyright 2016-2017 AdlerTech
var Graphene;
(function (Graphene) {
    var Instance = /** @class */ (function () {
        function Instance(id, canvas, config, useroverlay) {
            if (useroverlay === void 0) { useroverlay = null; }
            var _this = this;
            this._activeAtomCount = 0;
            this._atoms = new Array();
            this._height = 0;
            this._width = 0;
            this._loopId = 0;
            this._lastRunTimeStamp = 0;
            this._cyclesExceeded = 0;
            this._autoAtomLimit = 0;
            this._framesBetweenControl = 0;
            this._control = new Graphene.Control();
            this.Links = new Array();
            this.mainLoop = function (timestamp) {
                _this._control.onFrameStart();
                _this.controlAtomPopulation();
                _this._physics.update(timestamp);
                if (_this._lastRunTimeStamp === 0 ||
                    _this.Config.MaxFPS === 0 ||
                    _this._lastRunTimeStamp < timestamp - (1000 / _this.Config.MaxFPS)) {
                    _this._renderer.doRenderCycle();
                    _this._lastRunTimeStamp = timestamp;
                }
                if (_this._userInterface != null) {
                    _this._userInterface.onUpdateCycle(_this._physics);
                }
                _this._loopId = window.requestAnimationFrame(_this.mainLoop);
                _this._control.onFrameStop();
            };
            this.onWindowResize = function (ev) {
                _this.updateCanvasDimensions();
            };
            this._id = id;
            this._canvas = canvas;
            this._config = Graphene.Config.parse(config);
            if (this._config.UserInterface) {
                this._userInterface = new Graphene.UserInterface(this, this._canvas);
                this._userInterface.bindTo(useroverlay != null ? useroverlay : canvas);
            }
            this.updateCanvasDimensions();
            this._renderer = new Graphene.Renderer(this._canvas, this);
            this._physics = new Graphene.Physics(this, this._control);
            window.addEventListener('resize', this.onWindowResize);
        }
        Instance.prototype.start = function () {
            if (this._loopId === 0) {
                this._loopId = window.requestAnimationFrame(this.mainLoop);
            }
        };
        Instance.prototype.stop = function () {
            if (this._loopId !== 0) {
                window.cancelAnimationFrame(this._loopId);
            }
        };
        Instance.prototype.controlAtomPopulation = function () {
            var densityAtomCount = Math.round(this.Config.Density !== 0 ?
                (this._width * this._height) / 1000 * this.Config.Density : 0);
            var maxAtoms = this.Config.MaxAtoms;
            var maxFrameTime = 1000 / this.Config.MaxFPS;
            var averageFrameTime = this._control.AverageFrameTime;
            var maxPhysicsTime = 1000 / this.Config.TPS * 0.5;
            var averagePhysicsTime = this._control.AveragePhysicsTime;
            var targetAtomCount = 0;
            if (densityAtomCount > 0 && maxAtoms > 0) {
                targetAtomCount = densityAtomCount > maxAtoms ? maxAtoms : densityAtomCount;
            }
            else if (densityAtomCount > 0 && maxAtoms === 0) {
                targetAtomCount = densityAtomCount;
            }
            else if (densityAtomCount === 0 && maxAtoms > 0) {
                targetAtomCount = maxAtoms;
            }
            if (this.Config.AutoAdjustAtomCount) {
                var atoms = this._activeAtomCount; // > 0 ? this._activeAtomCount : maxAtoms;
                if (this._control.LastFrameTime > 500) {
                    targetAtomCount = (atoms * 0.2) | 0;
                    this._autoAtomLimit = targetAtomCount;
                    console.log('PopulationControl:', 'Panic, reducing atom count from ' + atoms + ' to ' + targetAtomCount);
                }
                else if (this._framesBetweenControl <= 0 && averageFrameTime > maxFrameTime * 1.5) {
                    var f = maxFrameTime / averageFrameTime;
                    if (f < 0.8) {
                        f = 0.8;
                    }
                    targetAtomCount = Math.round(atoms * f);
                    if (targetAtomCount <= 1) {
                        targetAtomCount = 2;
                    }
                    this._autoAtomLimit = targetAtomCount;
                    this._framesBetweenControl = 100;
                    console.log('PopulationControl:', 'Reducing atom count from ' + atoms + ' to ' + targetAtomCount + ' Factor is:' + f);
                    console.log('AverageFrameTime: ', averageFrameTime, 'MaxFrameTime', maxFrameTime);
                }
                else if (this._framesBetweenControl <= 0
                    && averageFrameTime > 0 && averageFrameTime < maxFrameTime * 0.5
                    && (maxAtoms === 0 || atoms < maxAtoms)
                    && (densityAtomCount === 0 || atoms < densityAtomCount)) {
                    var f = maxFrameTime / averageFrameTime;
                    if (f > 1.2) {
                        f = 1.2;
                    }
                    targetAtomCount = Math.round(atoms * f);
                    if (targetAtomCount - atoms > 250) {
                        targetAtomCount = atoms + 250;
                    }
                    if (targetAtomCount === atoms) {
                        targetAtomCount++;
                    }
                    if (densityAtomCount > 0 && targetAtomCount > densityAtomCount) {
                        targetAtomCount = densityAtomCount;
                    }
                    if (maxAtoms > 0 && targetAtomCount > maxAtoms) {
                        targetAtomCount = maxAtoms;
                    }
                    this._autoAtomLimit = targetAtomCount;
                    this._framesBetweenControl = 100;
                    console.log('PopulationControl:', 'Increasing atom count from ' + atoms + ' to ' + targetAtomCount + ' Factor is:' + f);
                    console.log('AverageFrameTime: ', averageFrameTime, 'MaxFrameTime', maxFrameTime);
                }
                else if (this._autoAtomLimit > 0) {
                    targetAtomCount = this._autoAtomLimit;
                }
                this._framesBetweenControl--;
            }
            if (this._atoms.length < targetAtomCount) {
                this._atoms.length = targetAtomCount;
            }
            else if (this._atoms.length > targetAtomCount) {
                this._atoms.splice(targetAtomCount, this._atoms.length - targetAtomCount);
            }
            for (var i = 0; i < this._atoms.length; ++i) {
                if (this._atoms[i] == null) {
                    // tslint:disable-next-line:max-line-length
                    this._atoms[i] = new Graphene.Atom(i, this.Config.AtomMinSize, this.Config.AtomMaxSize, this.getRandomPosition(), this.getRandomVector());
                }
            }
            this._activeAtomCount = this._atoms.length;
        };
        Instance.prototype.getRandomPosition = function () {
            return new Graphene.Point(Math.random() * this.Width, Math.random() * this.Height);
        };
        Instance.prototype.getRandomVector = function () {
            var v = new Graphene.Vector(1, 1).scaleTo(Math.random() * 200);
            return v.rotate(Math.random() * 2 * Math.PI);
        };
        Instance.prototype.updateCanvasDimensions = function () {
            var c = this._config;
            var p = this._canvas.parentElement;
            if (c.Width === 0) {
                if (c.MaxWidth > 0) {
                    this._width = p.clientWidth > c.MaxWidth ? c.MaxWidth : p.clientWidth;
                }
                else {
                    this._width = p.clientWidth;
                }
            }
            else {
                this._width = c.Width;
            }
            if (c.Height === 0) {
                if (c.MaxHeight > 0) {
                    this._height = p.clientHeight > c.MaxHeight ? c.MaxHeight : p.clientHeight;
                }
                else {
                    this._height = p.clientHeight;
                }
            }
            else {
                this._height = c.Height;
            }
            this._canvas.setAttribute('width', this._width.toString(10));
            this._canvas.setAttribute('height', this._height.toString(10));
        };
        Object.defineProperty(Instance.prototype, "Config", {
            get: function () {
                return this._config;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Instance.prototype, "Atoms", {
            get: function () {
                return this._atoms;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Instance.prototype, "Physics", {
            get: function () {
                return this._physics;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Instance.prototype, "Height", {
            get: function () {
                return this._height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Instance.prototype, "Width", {
            get: function () {
                return this._width;
            },
            enumerable: true,
            configurable: true
        });
        return Instance;
    }());
    Graphene.Instance = Instance;
    var Dimensions = /** @class */ (function () {
        function Dimensions() {
        }
        return Dimensions;
    }());
    Graphene.Dimensions = Dimensions;
})(Graphene || (Graphene = {}));
// Copyright 2016-2017 AdlerTech
var Graphene;
(function (Graphene) {
    var Physics = /** @class */ (function () {
        function Physics(instance, control) {
            this._lastRunTimestamp = 0;
            this._quadTree = null;
            this._instance = instance;
            this._config = instance.Config;
            this._control = control;
        }
        Physics.prototype.update = function (timestamp) {
            var step = 1000 / this._config.TPS;
            var delta = this._lastRunTimestamp === 0 ? step : timestamp - this._lastRunTimestamp;
            if (delta > step * 100) {
                console.log('Physics could not keep up. Skipping ' + Math.floor(delta / step) + ' Physics ticks.');
                delta = step * 100;
            }
            for (; delta >= step; delta -= step) {
                this._control.onPhysicsStart();
                this._quadTree = null;
                this.applyForce();
                this.applyAtomWallCollisions();
                this.checkAtomAtomCollisions();
                this.moveAtoms();
                this.applyLinks();
                this._control.onPhysicsStop();
            }
            this._lastRunTimestamp = timestamp - delta; // If we skip parts of a step run it next time
        };
        Physics.prototype.applyAtomWallCollisions = function () {
            if (!this._config.WallCollisions) {
                return;
            }
            var friction = this._config.WallFriction;
            var width = this._instance.Width;
            var height = this._instance.Height;
            var outSideBoxX = function (atom) {
                return (atom.Position.X - atom.Size < 0 && atom.Vector.X < 0)
                    || (atom.Position.X + atom.Size >= width && atom.Vector.X > 0);
            };
            var outSideBoxY = function (atom) {
                return (atom.Position.Y - atom.Size < 0 && atom.Vector.Y < 0)
                    || (atom.Position.Y + atom.Size >= height && atom.Vector.Y > 0);
            };
            for (var _i = 0, _a = this._instance.Atoms; _i < _a.length; _i++) {
                var atom = _a[_i];
                if (outSideBoxX(atom)) {
                    atom.Vector = new Graphene.Vector(atom.Vector.X * -1, atom.Vector.Y);
                }
                if (outSideBoxY(atom)) {
                    atom.Vector = new Graphene.Vector(atom.Vector.X, atom.Vector.Y * -1);
                }
                while (outSideBoxX(atom) || outSideBoxY(atom)) {
                    var v = atom.Vector.scaleBy(this.getSpeedFactor() * 0.1);
                    atom.Position.X += v.X;
                    atom.Position.Y += v.Y;
                }
            }
        };
        Physics.prototype.applyAtomAtomCollision = function (atom1, atom2) {
            var dist = atom1.Size + atom2.Size;
            var cnt = 0;
            while (dist > atom1.distanceTo(atom2)) {
                atom1.Position.X += -atom1.Vector.X * this.getSpeedFactor() * 0.1;
                atom1.Position.Y += -atom1.Vector.Y * this.getSpeedFactor() * 0.1;
                atom2.Position.X += -atom2.Vector.X * this.getSpeedFactor() * 0.1;
                atom2.Position.Y += -atom2.Vector.Y * this.getSpeedFactor() * 0.1;
                ++cnt;
            }
            var calcVsAndVe = function (nd1, nd2) {
                var n = Graphene.Vector.fromAtoms(nd1, nd2);
                n = n.scaleTo(nd1.Size);
                var alph = nd1.Vector.angle(n);
                var vS = new Graphene.Vector(n.X, n.Y);
                vS = vS.scaleTo(nd1.Vector.length() * Math.cos(alph));
                var x = nd1.Vector.X - vS.X;
                var y = nd1.Vector.Y - vS.X / n.X * n.Y;
                var vE = new Graphene.Vector(x, y);
                return { vS: vS, vE: vE };
            };
            var obj1 = calcVsAndVe(atom1, atom2);
            var vS1 = obj1.vS;
            var vE1 = obj1.vE;
            var obj2 = calcVsAndVe(atom2, atom1);
            var vS2 = obj2.vS;
            var vE2 = obj2.vE;
            // Resultierender Vektor parallel zu Stoßnormalen
            var friction = this._config.AtomFriction;
            var calcU = function (v1, v2, m1, m2) {
                var X = (m1 * v1.X + m2 * (2 * v2.X - v1.X)) / (m1 + m2);
                var Y = (m1 * v1.Y + m2 * (2 * v2.Y - v1.Y)) / (m1 + m2);
                return new Graphene.Vector(X, Y).scaleBy(friction);
            };
            var uS1 = calcU(vS1, vS2, atom1.Mass, atom2.Mass);
            var uS2 = calcU(vS2, vS1, atom2.Mass, atom1.Mass);
            atom1.Vector = uS1.add(vE1);
            atom2.Vector = uS2.add(vE2);
        };
        Physics.prototype.applyForce = function () {
            var g = new Graphene.Vector(this._instance.Config.Gravity.X, this._instance.Config.Gravity.Y);
            if (g.length() > 0) {
                for (var _i = 0, _a = this._instance.Atoms; _i < _a.length; _i++) {
                    var atom = _a[_i];
                    atom.Vector = atom.Vector.add(g.scaleBy(this.getSpeedFactor()));
                }
            }
            var electricalForce = this._config.ElectricalForce;
            if (electricalForce > 0 || electricalForce < 0) {
                for (var _b = 0, _c = this._instance.Atoms; _b < _c.length; _b++) {
                    var a = _c[_b];
                    for (var i = a.Id + 1; i < this._instance.Atoms.length; ++i) {
                        var a2 = this._instance.Atoms[i];
                        var v = Graphene.Vector.fromAtoms(a, a2).invert();
                        var d = v.length();
                        var f = electricalForce * a.Charge * a2.Charge / Math.pow(d, 2);
                        var v1 = v.scaleTo(f);
                        var v2 = v1.invert();
                        a.Vector = a.Vector.add(v1);
                        a2.Vector = a2.Vector.add(v2);
                    }
                }
            }
        };
        Physics.prototype.applyLinks = function () {
            var len = this._instance.Atoms.length;
            var maxLinkLength = this._config.MaxLinkLength;
            var maxLinks = this._config.MaxLinksPerAtom > 0 ? this._config.MaxLinksPerAtom : Number.MAX_VALUE;
            if (this._instance.Links.length !== len) {
                this._instance.Links.length = len;
            }
            this._instance.Atoms.forEach(function (atom) { return atom.Links = 0; });
            for (var _i = 0, _a = this._instance.Atoms; _i < _a.length; _i++) {
                var a1 = _a[_i];
                for (var i = a1.Id + 1; i < len; ++i) {
                    var a2 = this._instance.Atoms[i];
                    if (this._instance.Links[a1.Id] == null || this._instance.Links[a1.Id].length !== len) {
                        this._instance.Links[a1.Id] = new Array(len);
                    }
                    if (a1.distanceTo(a2) <= maxLinkLength && a1.Links < maxLinks && a2.Links < maxLinks) {
                        a1.Links++;
                        a2.Links++;
                        this._instance.Links[a1.Id][a2.Id] = true;
                    }
                    else {
                        this._instance.Links[a1.Id][a2.Id] = false;
                    }
                }
            }
        };
        Physics.prototype.checkAtomAtomCollisions = function () {
            if (!this._config.AtomCollisions) {
                return;
            }
            var q = this.QuadTree;
            for (var _i = 0, _a = this._instance.Atoms; _i < _a.length; _i++) {
                var nd = _a[_i];
                var collisionNds = q.getItems(nd.Position.X, nd.Position.Y);
                for (var _b = 0, collisionNds_1 = collisionNds; _b < collisionNds_1.length; _b++) {
                    var colNd = collisionNds_1[_b];
                    if (colNd.Id > nd.Id && nd.collidesWith(colNd)) {
                        this.applyAtomAtomCollision(nd, colNd);
                    }
                }
            }
        };
        Physics.prototype.getSpeedFactor = function () {
            return 1 / this._config.TPS;
        };
        Physics.prototype.moveAtoms = function () {
            var sf = this.getSpeedFactor();
            for (var _i = 0, _a = this._instance.Atoms; _i < _a.length; _i++) {
                var atom = _a[_i];
                if (!atom.PhysicsLocked) {
                    atom.Position.X += atom.Vector.X * sf;
                    atom.Position.Y += atom.Vector.Y * sf;
                }
            }
        };
        Object.defineProperty(Physics.prototype, "QuadTree", {
            get: function () {
                if (this._quadTree == null) {
                    this._quadTree = new Graphene.QuadTree(0, new Graphene.Rectangle(0, 0, this._instance.Width, this._instance.Height));
                    this._quadTree.addItems(this._instance.Atoms);
                }
                return this._quadTree;
            },
            enumerable: true,
            configurable: true
        });
        return Physics;
    }());
    Graphene.Physics = Physics;
})(Graphene || (Graphene = {}));
// Copyright 2016-2017 AdlerTech
var Graphene;
(function (Graphene) {
    var Renderer = /** @class */ (function () {
        function Renderer(canvas, instance) {
            this._canvas = canvas;
            this._ctx = canvas.getContext('2d', { alpha: instance.Config.AlphaBackground });
            this._instance = instance;
        }
        Renderer.prototype.doRenderCycle = function () {
            this.drawBackground();
            if (this._instance.Config.DrawQuadTree) {
                this.drawQuadTree();
            }
            this.applyOcclusionCulling();
            if (this._instance.Config.MaxLinkLength > 0) {
                this.drawLinks();
            }
            this.drawAtoms();
        };
        Renderer.prototype.applyOcclusionCulling = function () {
            for (var _i = 0, _a = this._instance.Atoms; _i < _a.length; _i++) {
                var atom = _a[_i];
                if ((atom.Size + atom.Position.X < 0 || atom.Position.X - atom.Size > this._instance.Width)
                    && (atom.Size + atom.Position.Y < 0 || atom.Position.Y - atom.Size > this._instance.Height)) {
                    atom.Visible = false;
                }
                else {
                    atom.Visible = true;
                }
            }
        };
        Renderer.prototype.drawAtoms = function () {
            var atomBorderColor = this._instance.Config.AtomBorderColor;
            var atomColor = this._instance.Config.AtomColor;
            // Because fill seems to be magnitudes faster than stroke fill border and inner
            // First draw `Border` below atom then draw atom inner color
            for (var _i = 0, _a = this._instance.Atoms; _i < _a.length; _i++) {
                var atom = _a[_i];
                if (!atom.Visible) {
                    continue;
                }
                this._ctx.fillStyle = atomBorderColor;
                this._ctx.beginPath();
                this._ctx.arc(atom.Position.X, atom.Position.Y, atom.Size, 0, Math.PI * 2);
                this._ctx.fill();
                this._ctx.fillStyle = atomColor[0];
                this._ctx.beginPath();
                this._ctx.arc(atom.Position.X, atom.Position.Y, atom.Size - 1.5, 0, Math.PI * 2);
                this._ctx.fill();
            }
        };
        Renderer.prototype.drawBackground = function () {
            var i = this._instance;
            this._ctx.clearRect(0, 0, i.Width, i.Height);
            this._ctx.fillStyle = i.Config.BackgroundColor;
            this._ctx.fillRect(0, 0, i.Width, i.Height);
        };
        Renderer.prototype.drawLinks = function () {
            var len = this._instance.Atoms.length;
            var links = this._instance.Links;
            for (var _i = 0, _a = this._instance.Atoms; _i < _a.length; _i++) {
                var a1 = _a[_i];
                if (a1.Links > 0) {
                    for (var i = a1.Id + 1; i < len; ++i) {
                        var a2 = this._instance.Atoms[i];
                        if (links[a1.Id][a2.Id] && (a1.Visible || a2.Visible)) {
                            this.drawLink(a1, a2);
                        }
                    }
                }
            }
        };
        Renderer.prototype.drawLink = function (atom1, atom2) {
            var dist = atom1.distanceTo(atom2);
            var v = Graphene.Vector.fromAtoms(atom1, atom2);
            var p1 = atom1.Position.clone();
            var p2 = atom2.Position.clone();
            var v1 = v.scaleTo(atom1.Size);
            p1.X += v1.X;
            p1.Y += v1.Y;
            var v2 = v.invert().scaleTo(atom2.Size);
            p2.X += v2.X;
            p2.Y += v2.Y;
            var fac = (1 - (dist * dist) / Math.pow(this._instance.Config.MaxLinkLength, 2));
            if (fac < 0) {
                fac = 0;
            }
            this._ctx.lineWidth = this._instance.Config.LinkWidth * fac;
            this._ctx.strokeStyle = this._instance.Config.LinkColor;
            this._ctx.beginPath();
            this._ctx.moveTo(p1.X, p1.Y);
            this._ctx.lineTo(p2.X, p2.Y);
            this._ctx.stroke();
        };
        Renderer.prototype.drawQuadTree = function (tree) {
            if (tree === void 0) { tree = this._instance.Physics.QuadTree; }
            this._ctx.font = '14px Arial';
            this._ctx.textAlign = 'center';
            this._ctx.fillStyle = '#ff00f2';
            if (tree !== null) {
                if (tree.IsSplit) {
                    var b = tree.Bounds;
                    // const c: Color = Color.fromHSV(120 + 40 * tree.Level, 1, 1);
                    this._ctx.strokeStyle = '#ff00f2'; // c.toRGBString();
                    this._ctx.lineWidth = 1;
                    {
                        this._ctx.beginPath();
                        this._ctx.moveTo(b.XMid, b.Y1);
                        this._ctx.lineTo(b.XMid, b.Y2);
                        this._ctx.stroke();
                        this._ctx.beginPath();
                        this._ctx.moveTo(b.X1, b.YMid);
                        this._ctx.lineTo(b.X2, b.YMid);
                        this._ctx.stroke();
                    }
                    this._ctx.fillText('Spares:' + tree.Spares, b.XMid, b.YMid);
                    for (var _i = 0, _a = tree.Sectors; _i < _a.length; _i++) {
                        var sector = _a[_i];
                        this.drawQuadTree(sector);
                    }
                }
                else {
                    this._ctx.fillText('Objects:' + tree.Objects, tree.Bounds.XMid, tree.Bounds.YMid);
                }
            }
        };
        return Renderer;
    }());
    Graphene.Renderer = Renderer;
})(Graphene || (Graphene = {}));
// Copyright 2017 AdlerTech
var Graphene;
(function (Graphene) {
    var Point = /** @class */ (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this._x = x;
            this._y = y;
        }
        Point.prototype.clone = function () {
            return new Point(this._x, this._y);
        };
        Object.defineProperty(Point.prototype, "X", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "Y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            },
            enumerable: true,
            configurable: true
        });
        return Point;
    }());
    Graphene.Point = Point;
})(Graphene || (Graphene = {}));
// Copyright 2017 AdlerTech
/// <reference path="types/point.ts" />
var Graphene;
(function (Graphene) {
    var UserInterface = /** @class */ (function () {
        function UserInterface(instance, canvas) {
            var _this = this;
            this._pendingMouseAction = MouseAction.NONE;
            this._mouseDown = false;
            this._mousePosition = new MousePosition();
            this._lastMousePosition = new MousePosition();
            this._mouseMove = new Graphene.Vector();
            this._focusedAtom = null;
            this.onMouseDown = function (event) {
                _this._mouseDown = true;
                _this._mousePosition.X = _this.translateX(event.clientX);
                _this._mousePosition.Y = _this.translateY(event.clientY);
                _this._mousePosition.updateRecordTime();
                _this._pendingMouseAction = MouseAction.CLICK;
            };
            this.onMouseMove = function (event) {
                _this._lastMousePosition.X = _this.MousePosition.X;
                _this._lastMousePosition.Y = _this.MousePosition.Y;
                _this._lastMousePosition.updateRecordTime(_this.MousePosition.Time);
                _this._mousePosition.X = _this.translateX(event.clientX);
                _this._mousePosition.Y = _this.translateY(event.clientY);
                _this._mousePosition.updateRecordTime();
            };
            this.onMouseUp = function (event) {
                _this._mousePosition.X = _this.translateX(event.clientX);
                _this._mousePosition.Y = _this.translateY(event.clientY);
                _this._mousePosition.updateRecordTime();
                _this._mouseDown = false;
                _this._pendingMouseAction = MouseAction.RELEASE;
            };
            console.log('Constructing User Interface');
            this._instance = instance;
            this._canvas = canvas;
        }
        UserInterface.prototype.bindTo = function (element) {
            if (this._boundElement != null) {
                this._boundElement.removeEventListener('mousedown', this.onMouseDown);
                this._boundElement.removeEventListener('mousemove', this.onMouseMove);
                this._boundElement.removeEventListener('mouseup', this.onMouseUp);
                this._boundElement = null;
            }
            if (element != null) {
                this._boundElement = element;
                this._boundElement.addEventListener('mousedown', this.onMouseDown);
                this._boundElement.addEventListener('mousemove', this.onMouseMove);
                this._boundElement.addEventListener('mouseup', this.onMouseUp);
            }
        };
        UserInterface.prototype.onUpdateCycle = function (physics) {
            var targetedAtom = this.findTargetedAtom(physics.QuadTree, this.MousePosition);
            if (this._pendingMouseAction === MouseAction.CLICK) {
                // Find atom and do physics lock
                if (targetedAtom != null) {
                    this._focusedAtom = targetedAtom;
                    this._focusedAtom.PhysicsLocked = true;
                    var vector = Graphene.Vector.fromPoints(this._lastMousePosition, this._mousePosition);
                    this._focusedAtom.Vector = vector.scaleBy(1000 / (this.MousePosition.Time - this._lastMousePosition.Time));
                    this._boundElement.style.cursor = 'move';
                }
            }
            else if (this._pendingMouseAction === MouseAction.RELEASE) {
                // If has atom, set atom vector and relase physics lock
                if (this._focusedAtom != null) {
                    this._focusedAtom.PhysicsLocked = false;
                    // Set Vector
                    var vector = Graphene.Vector.fromPoints(this._lastMousePosition, this._mousePosition);
                    this._focusedAtom.Vector = vector.scaleBy(1000 / (this.MousePosition.Time - this._lastMousePosition.Time));
                    this._focusedAtom = null;
                }
                this._boundElement.style.cursor = 'default';
            }
            else if (this._mouseDown && this._focusedAtom != null) {
                // Update Atom position
                this._focusedAtom.Position.X = this.MousePosition.X;
                this._focusedAtom.Position.Y = this.MousePosition.Y;
                this._boundElement.style.cursor = 'move';
            }
            else {
                // Update cursor
                this._boundElement.style.cursor = targetedAtom != null ? 'pointer' : 'default';
            }
            this._pendingMouseAction = MouseAction.NONE;
        };
        UserInterface.prototype.findTargetedAtom = function (quadTree, point) {
            for (var _i = 0, _a = quadTree.getItems(point.X, point.Y); _i < _a.length; _i++) {
                var atom = _a[_i];
                if (Math.abs(atom.Position.X - point.X) < atom.Size + 2 && Math.abs(atom.Position.Y - point.Y) < atom.Size + 2) {
                    return atom;
                }
            }
            return null;
        };
        UserInterface.prototype.translateX = function (x) {
            var canvasRect = this._canvas.getBoundingClientRect();
            return x - canvasRect.left;
        };
        UserInterface.prototype.translateY = function (y) {
            var canvasRect = this._canvas.getBoundingClientRect();
            return y - canvasRect.top;
        };
        Object.defineProperty(UserInterface.prototype, "MousePosition", {
            get: function () {
                return this._mousePosition;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserInterface.prototype, "MouseDown", {
            get: function () {
                return this._mouseDown;
            },
            enumerable: true,
            configurable: true
        });
        return UserInterface;
    }());
    Graphene.UserInterface = UserInterface;
    var MouseAction;
    (function (MouseAction) {
        MouseAction[MouseAction["NONE"] = 0] = "NONE";
        MouseAction[MouseAction["CLICK"] = 1] = "CLICK";
        MouseAction[MouseAction["RELEASE"] = 2] = "RELEASE";
    })(MouseAction = Graphene.MouseAction || (Graphene.MouseAction = {}));
    var MousePosition = /** @class */ (function (_super) {
        __extends(MousePosition, _super);
        function MousePosition(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            var _this = _super.call(this, x, y) || this;
            _this._timestamp = 0;
            _this.updateRecordTime();
            return _this;
        }
        MousePosition.prototype.updateRecordTime = function (timestamp) {
            if (timestamp === void 0) { timestamp = 0; }
            if (timestamp === 0) {
                this._timestamp = Date.now();
            }
            else {
                this._timestamp = timestamp;
            }
        };
        Object.defineProperty(MousePosition.prototype, "Time", {
            get: function () {
                return this._timestamp;
            },
            enumerable: true,
            configurable: true
        });
        return MousePosition;
    }(Graphene.Point));
    Graphene.MousePosition = MousePosition;
})(Graphene || (Graphene = {}));
// Copyright 2016-2017 AdlerTech
var Graphene;
(function (Graphene) {
    var Atom = /** @class */ (function () {
        function Atom(id, minSize, maxSize, pos, vec) {
            this._physicsLock = false;
            this.Links = 0;
            this._id = id;
            this._position = pos;
            this._charge = Math.random() > 0.5 ? 1 : -1;
            this._size = Math.random() * Math.abs(maxSize - minSize) + Math.abs(minSize);
            this._mass = (4 / 3) * Math.PI * Math.pow(this._size, 3);
            this._vector = vec;
        }
        Atom.prototype.collidesWith = function (atom) {
            return this.Id !== atom.Id
                && this.distanceTo(atom) < this.Size + atom.Size;
        };
        Atom.prototype.distanceTo = function (atom) {
            var x = atom.Position.X - this.Position.X;
            var y = atom.Position.Y - this.Position.Y;
            return Math.sqrt(x * x + y * y);
        };
        Object.defineProperty(Atom.prototype, "Charge", {
            get: function () {
                return this._charge;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Atom.prototype, "Color", {
            get: function () {
                return this._color;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Atom.prototype, "Id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Atom.prototype, "Mass", {
            get: function () {
                return this._mass;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Atom.prototype, "PhysicsLocked", {
            get: function () {
                return this._physicsLock;
            },
            set: function (value) {
                this._physicsLock = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Atom.prototype, "Position", {
            get: function () {
                return this._position;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Atom.prototype, "Size", {
            get: function () {
                return this._size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Atom.prototype, "Vector", {
            get: function () {
                return this._vector;
            },
            set: function (value) {
                this._vector = value;
            },
            enumerable: true,
            configurable: true
        });
        return Atom;
    }());
    Graphene.Atom = Atom;
})(Graphene || (Graphene = {}));
// Copyright 2016-2017 AdlerTech
var Graphene;
(function (Graphene) {
    var MAX_LEVEL = 5;
    var MAX_OBJECTS = 10;
    var QuadTree = /** @class */ (function () {
        function QuadTree(level, rect) {
            this._objects = new Array();
            this._spares = new Array();
            this._isSplit = false;
            this._level = level;
            this._bounds = rect;
        }
        QuadTree.prototype.addItem = function (atom) {
            if (!this._isSplit) {
                if (this._objects.length > MAX_OBJECTS && this._level < MAX_LEVEL) {
                    this.split();
                    this.addItem(atom);
                }
                else {
                    this._objects.push(atom);
                }
            }
            else {
                if (this.isSpare(atom)) {
                    this._spares.push(atom);
                }
                else {
                    var sector = this.getSector(atom.Position.X, atom.Position.Y);
                    sector.addItem(atom);
                }
            }
        };
        QuadTree.prototype.addItems = function (atoms) {
            for (var _i = 0, atoms_1 = atoms; _i < atoms_1.length; _i++) {
                var p = atoms_1[_i];
                this.addItem(p);
            }
        };
        QuadTree.prototype.getItems = function (x, y) {
            if (this._isSplit) {
                var sec = this.getSector(x, y);
                var res = sec.getItems(x, y);
                return res.concat(this._spares);
            }
            else {
                return this._objects;
            }
        };
        QuadTree.prototype.getSector = function (x, y) {
            /* Sectors are placed this way:
            1 | 2
            --|--
            4 | 3
            */
            var secId = 0;
            if (x > this._bounds.X1 && x < this._bounds.XMid) {
                if (y > this._bounds.Y1 && y < this._bounds.YMid) {
                    secId = 0;
                }
                else {
                    secId = 3;
                }
            }
            else {
                if (y > this._bounds.Y1 && y < this._bounds.YMid) {
                    secId = 1;
                }
                else {
                    secId = 2;
                }
            }
            return this._sectors[secId];
        };
        QuadTree.prototype.isSpare = function (atom) {
            var spareDist = atom.Size;
            if (atom.Position.X >= this._bounds.XMid - spareDist && atom.Position.X <= this._bounds.XMid + spareDist) {
                return true;
            }
            if (atom.Position.Y >= this._bounds.YMid - spareDist && atom.Position.Y <= this._bounds.YMid + spareDist) {
                return true;
            }
            return false;
        };
        QuadTree.prototype.split = function () {
            if (!this._isSplit) {
                this._sectors = new Array(4);
                var b = this._bounds;
                this._sectors[0] = new QuadTree(this._level + 1, new Rectangle(b.X1, b.Y1, b.XMid, b.YMid));
                this._sectors[1] = new QuadTree(this._level + 1, new Rectangle(b.XMid, b.Y1, b.X2, b.YMid));
                this._sectors[2] = new QuadTree(this._level + 1, new Rectangle(b.XMid, b.YMid, b.X2, b.Y2));
                this._sectors[3] = new QuadTree(this._level + 1, new Rectangle(b.X1, b.YMid, b.XMid, b.Y2));
                for (var _i = 0, _a = this._objects; _i < _a.length; _i++) {
                    var obj = _a[_i];
                    if (this.isSpare(obj)) {
                        this._spares.push(obj);
                    }
                    else {
                        var sec = this.getSector(obj.Position.X, obj.Position.Y);
                        sec.addItem(obj);
                    }
                }
                this._objects = [];
            }
            this._isSplit = true;
        };
        Object.defineProperty(QuadTree.prototype, "Bounds", {
            get: function () {
                return this._bounds;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QuadTree.prototype, "IsSplit", {
            get: function () {
                return this._isSplit;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QuadTree.prototype, "Level", {
            get: function () {
                return this._level;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QuadTree.prototype, "Objects", {
            get: function () {
                return this._objects.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QuadTree.prototype, "Spares", {
            get: function () {
                return this._spares.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QuadTree.prototype, "Sectors", {
            get: function () {
                return this._sectors;
            },
            enumerable: true,
            configurable: true
        });
        return QuadTree;
    }());
    Graphene.QuadTree = QuadTree;
    var Rectangle = /** @class */ (function () {
        function Rectangle(x1, y1, x2, y2) {
            this._x1 = x1;
            this._x2 = x2;
            this._xMid = Math.floor(x2 - x1) / 2 + x1;
            this._y1 = y1;
            this._y2 = y2;
            this._yMid = Math.floor(y2 - y1) / 2 + y1;
        }
        Object.defineProperty(Rectangle.prototype, "X1", {
            get: function () {
                return this._x1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "X2", {
            get: function () {
                return this._x2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "XMid", {
            get: function () {
                return this._xMid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "Y1", {
            get: function () {
                return this._y1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "Y2", {
            get: function () {
                return this._y2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "YMid", {
            get: function () {
                return this._yMid;
            },
            enumerable: true,
            configurable: true
        });
        return Rectangle;
    }());
    Graphene.Rectangle = Rectangle;
})(Graphene || (Graphene = {}));
// Copyright 2016-2017 AdlerTech
var Graphene;
(function (Graphene) {
    var Vector = /** @class */ (function () {
        function Vector(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this._x = x;
            this._y = y;
        }
        Object.defineProperty(Vector.prototype, "X", {
            get: function () {
                return this._x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector.prototype, "Y", {
            get: function () {
                return this._y;
            },
            enumerable: true,
            configurable: true
        });
        Vector.fromAtoms = function (atom1, atom2) {
            return new Vector(atom2.Position.X - atom1.Position.X, atom2.Position.Y - atom1.Position.Y);
        };
        Vector.fromPoints = function (point1, point2) {
            return new Vector(point2.X - point1.X, point2.Y - point1.Y);
        };
        Vector.prototype.add = function (v) {
            return new Vector(this._x + v._x, this._y + v._y);
        };
        Vector.prototype.angle = function (v) {
            var sc = this.scalar(v);
            var l = this.length() * v.length();
            if (l === 0) {
                return 0;
            }
            var c = sc / l;
            if (c < -1) {
                c = -1;
            }
            else if (c > 1) {
                c = 1;
            }
            return Math.acos(c);
        };
        Vector.prototype.invert = function () {
            return this.scaleBy(-1);
        };
        Vector.prototype.length = function () {
            return Math.sqrt(this._x * this._x + this._y * this._y);
        };
        Vector.prototype.rotate = function (angle) {
            var x = Math.cos(angle) * this._x - Math.sin(angle) * this._y;
            var y = Math.sin(angle) * this._x + Math.cos(angle) * this._y;
            return new Vector(x, y);
        };
        Vector.prototype.scalar = function (v) {
            return this._x * v._x + this._y * v._y;
        };
        Vector.prototype.scaleBy = function (scale) {
            return new Vector(this._x * scale, this._y * scale);
        };
        Vector.prototype.scaleTo = function (length) {
            var l = this.length();
            if (l !== 0) {
                var factor = length / l;
                return new Vector(this._x * factor, this._y * factor);
            }
            return new Vector(0, 0);
        };
        return Vector;
    }());
    Graphene.Vector = Vector;
})(Graphene || (Graphene = {}));

//# sourceMappingURL=graphene.js.map
