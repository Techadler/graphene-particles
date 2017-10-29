// Copyright 2016-2017 AdlerTech

module Graphene {
    export class Atom {
        private _id: number;
        private _charge: number;
        private _color: string;
        private _mass: number;
        private _position: Point;
        private _size: number;
        private _vector: Vector;
        private _physicsLock: boolean = false;
        public Links: number = 0;
        public Visible: boolean;

        constructor(id: number, minSize: number, maxSize: number, pos: Point, vec: Vector) {
            this._id = id;
            this._position = pos;
            this._charge = Math.random() > 0.5 ? 1 : -1;
            this._size = Math.random() * Math.abs(maxSize - minSize) + Math.abs(minSize);
            this._mass = (4 / 3) * Math.PI * Math.pow(this._size, 3);
            this._vector = vec;
        }

        public collidesWith(atom: Atom): boolean {
            return this.Id !== atom.Id
                && this.distanceTo(atom) < this.Size + atom.Size;
        }

        public distanceTo(atom: Atom): number {
            const x: number = atom.Position.X - this.Position.X;
            const y: number = atom.Position.Y - this.Position.Y;
            return Math.sqrt(x * x + y * y);
        }

        public get Charge(): number {
            return this._charge;
        }

        public get Color(): string {
            return this._color;
        }

        public get Id(): number {
            return this._id;
        }

        public get Mass(): number {
            return this._mass;
        }

        public get PhysicsLocked(): boolean {
            return this._physicsLock;
        }
        public set PhysicsLocked(value: boolean) {
            this._physicsLock = value;
        }

        public get Position(): Point {
            return this._position;
        }
        public get Size(): number {
            return this._size;
        }
        public get Vector(): Vector {
            return this._vector;
        }
        public set Vector(value: Vector) {
            this._vector = value;
        }
    }
}