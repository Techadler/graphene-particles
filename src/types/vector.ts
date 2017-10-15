// Copyright 2016-2017 AdlerTech

module Graphene {
    export class Vector {
        private _x: number;
        private _y: number;

        public get X(): number {
            return this._x;
        }

        public get Y(): number {
            return this._y;
        }

        constructor(x: number, y: number) {
            this._x = x;
            this._y = y;
        }

        public static fromAtoms(atom1: Atom, atom2: Atom): Vector {
            return new Vector(atom2.Position.X - atom1.Position.X, atom2.Position.Y - atom1.Position.Y);
        }

        public add(v: Vector): Vector {
            return new Vector(this._x + v._x, this._y + v._y);
        }

        public angle(v: Vector): number {
            const sc: number = this.scalar(v);
            const l: number = this.length() * v.length();
            if (l === 0) { return 0; }
            let c: number = sc / l;
            if (c < -1) {
                c = -1;
            } else if (c > 1) {
                c = 1;
            }
            return Math.acos(c);
        }

        public invert(): Vector {
            return this.scaleBy(-1);
        }

        public length(): number {
            return Math.sqrt(this._x * this._x + this._y * this._y);
        }

        public rotate(angle: number): Vector {
            const x: number = Math.cos(angle) * this._x - Math.sin(angle) * this._y;
            const y: number = Math.sin(angle) * this._x + Math.cos(angle) * this._y;
            return new Vector(x, y);
        }

        public scalar(v: Vector): number {
            return this._x * v._x + this._y * v._y;
        }

        public scaleBy(scale: number): Vector {
            return new Vector(this._x * scale, this._y * scale);
        }

        public scaleTo(length: number): Vector {
            const l: number = this.length();
            if (l !== 0) {
                const factor: number = length / l;
                return new Vector(this._x * factor, this._y * factor);
            }
            return new Vector(0, 0);
        }

    }
}