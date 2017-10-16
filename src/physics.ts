// Copyright 2016-2017 AdlerTech

module Graphene {
    export class Physics {
        private _lastRunTimestamp: number = 0;
        private _instance: Instance;
        private _config: Config;
        private _quadTree: QuadTree = null;

        constructor(instance: Instance) {
            this._instance = instance;
            this._config = instance.Config;
        }

        public update(timestamp: number): void {
            const step: number = 1000 / this._config.TPS;
            let delta: number = this._lastRunTimestamp === 0 ? step : timestamp - this._lastRunTimestamp;
            if (delta > step * 100) {
                console.log('Physics could not keep up. Skipping ' + Math.floor(delta / step) + ' Physics ticks.');
                delta = step * 100;
            }
            for (; delta >= step; delta -= step) {
                this._quadTree = null;
                this.applyForce();
                this.applyAtomWallCollisions();
                this.checkAtomAtomCollisions();
                this.moveAtoms();
                this.applyLinks();
            }
            this._lastRunTimestamp = timestamp - delta; // If we skip parts of a step run it next time
        }

        private applyAtomWallCollisions(): void {
            if (!this._config.WallCollisions) { return; }
            const friction: number = this._config.WallFriction;
            const width: number = this._instance.Width;
            const height: number = this._instance.Height;

            const outSideBoxX: Function = function (atom: Atom): boolean {
                return (atom.Position.X - atom.Size < 0 && atom.Vector.X < 0)
                    || (atom.Position.X + atom.Size >= width && atom.Vector.X > 0);
            };
            const outSideBoxY: Function = function (atom: Atom): boolean {
                return (atom.Position.Y - atom.Size < 0 && atom.Vector.Y < 0)
                    || (atom.Position.Y + atom.Size >= height && atom.Vector.Y > 0);
            };

            for (const atom of this._instance.Atoms) {
                if (outSideBoxX(atom)) {
                    atom.Vector = new Vector(atom.Vector.X * -1, atom.Vector.Y);
                }
                if (outSideBoxY(atom)) {
                    atom.Vector = new Vector(atom.Vector.X, atom.Vector.Y * -1);
                }
                while (outSideBoxX(atom) || outSideBoxY(atom)) {
                    const v: Vector = atom.Vector.scaleBy(this.getSpeedFactor() * 0.1);
                    atom.Position.X += v.X;
                    atom.Position.Y += v.Y;
                }
            }

        }

        private applyAtomAtomCollision(atom1: Atom, atom2: Atom): void {
            const dist: number = atom1.Size + atom2.Size;
            let cnt: number = 0;
            while (dist > atom1.distanceTo(atom2)) { // Move back to point of actual collision
                atom1.Position.X += -atom1.Vector.X * this.getSpeedFactor() * 0.1;
                atom1.Position.Y += -atom1.Vector.Y * this.getSpeedFactor() * 0.1;
                atom2.Position.X += -atom2.Vector.X * this.getSpeedFactor() * 0.1;
                atom2.Position.Y += -atom2.Vector.Y * this.getSpeedFactor() * 0.1;
                ++cnt;
            }
            // console.log('Took ' + cnt + ' steps back');
            const calcVsAndVe: Function = function (nd1: Atom, nd2: Atom): any { // vS in Richtung der Stoßnormalen, vE Orthogonal
                let n: Vector = Vector.fromAtoms(nd1, nd2);
                n = n.scaleTo(nd1.Size);
                const alph: number = nd1.Vector.angle(n);
                let vS: Vector = new Vector(n.X, n.Y);
                vS = vS.scaleTo(nd1.Vector.length() * Math.cos(alph));
                const x: number = nd1.Vector.X - vS.X;
                const y: number = nd1.Vector.Y - vS.X / n.X * n.Y;
                const vE: Vector = new Vector(x, y);
                return { vS: vS, vE: vE };
            };
            const obj1: any = calcVsAndVe(atom1, atom2);
            const vS1: Vector = obj1.vS; const vE1: Vector = obj1.vE;
            const obj2: any = calcVsAndVe(atom2, atom1);
            const vS2: Vector = obj2.vS; const vE2: Vector = obj2.vE;

            // Resultierender Vektor parallel zu Stoßnormalen
            const friction: number = this._config.AtomFriction;
            const calcU: Function = function (v1: Vector, v2: Vector, m1: number, m2: number): Vector {
                const X: number = (m1 * v1.X + m2 * (2 * v2.X - v1.X)) / (m1 + m2);
                const Y: number = (m1 * v1.Y + m2 * (2 * v2.Y - v1.Y)) / (m1 + m2);
                return new Vector(X, Y).scaleBy(friction);
            };
            const uS1: Vector = calcU(vS1, vS2, atom1.Mass, atom2.Mass);
            const uS2: Vector = calcU(vS2, vS1, atom2.Mass, atom1.Mass);
            atom1.Vector = uS1.add(vE1);
            atom2.Vector = uS2.add(vE2);
        }

        private applyForce(): void {
            const g: Vector = new Vector(this._instance.Config.Gravity.X, this._instance.Config.Gravity.Y);
            if (g.length() > 0) {
                for (const atom of this._instance.Atoms) {
                    atom.Vector = atom.Vector.add(g.scaleBy(this.getSpeedFactor()));
                }
            }
            for (const a of this._instance.Atoms) {
                for (let i: number = a.Id + 1; i < this._instance.Atoms.length; ++i) {
                    const a2: Atom = this._instance.Atoms[i];
                    const v: Vector = Vector.fromAtoms(a, a2).invert();
                    const d: number = v.length();
                    const f: number = 10 * 3 * 3 / Math.pow(d, 2);
                    const v1: Vector = v.scaleTo(f);
                    const v2: Vector = v1.invert();
                    a.Position.X += v1.X; a.Position.Y += v1.Y;
                    a2.Position.X += v2.X; a2.Position.Y += v2.Y;
                }
            }
        }

        private applyLinks(): void {
            const len: number = this._instance.Atoms.length;
            const maxLinkLength: number = this._config.MaxLinkLength;
            const maxLinks: number = this._config.MaxLinksPerAtom;
            if (this._instance.Links.length !== len) {
                this._instance.Links.length = len;
            }
            this._instance.Atoms.forEach((atom: Atom) => atom.Links = 0);
            for (const a1 of this._instance.Atoms) {
                for (let i: number = a1.Id + 1; i < len; ++i) {
                    const a2: Atom = this._instance.Atoms[i];
                    if (this._instance.Links[a1.Id] == null) { this._instance.Links[a1.Id] = new Array<boolean>(len); }
                    if (a1.distanceTo(a2) <= maxLinkLength && a1.Links < maxLinks && a2.Links < maxLinks) {
                        a1.Links++; a2.Links++;
                        this._instance.Links[a1.Id][a2.Id] = true;
                    } else {
                        this._instance.Links[a1.Id][a2.Id] = false;
                    }
                }
            }
        }

        private checkAtomAtomCollisions(): void {
            if (!this._config.AtomCollisions) { return; }
            const q: QuadTree = this.QuadTree;
            for (const nd of this._instance.Atoms) {
                const collisionNds: Atom[] = q.getItems(nd.Position.X, nd.Position.Y);
                for (const colNd of collisionNds) {
                    if (colNd.Id > nd.Id && nd.collidesWith(colNd)) {
                        this.applyAtomAtomCollision(nd, colNd);
                    }
                }
            }
        }

        private getSpeedFactor(): number {
            return 1 / this._config.TPS;
        }

        private moveAtoms(): void {
            const sf: number = this.getSpeedFactor();
            for (const atom of this._instance.Atoms) {
                atom.Position.X += atom.Vector.X * sf;
                atom.Position.Y += atom.Vector.Y * sf;
            }
        }

        public get QuadTree(): QuadTree {
            if (this._quadTree == null) {
                this._quadTree = new QuadTree(0, new Rectangle(0, 0, this._instance.Width, this._instance.Height));
                this._quadTree.addItems(this._instance.Atoms);
            }
            return this._quadTree;
        }
    }
}