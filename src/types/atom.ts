// Copyright 2016-2017 AdlerTech

module Graphene {
    export class Atom {
        private _id: number;
        private _mass: number;
        private _position: Graphene.Position;
        private _size: number;
        private _vector: Vector;

        constructor(id: number, minSize: number, maxSize: number, pos: Graphene.Position, vec: Vector) {
            this._id = id;
            this._position = pos;
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

        public get Id(): number {
            return this._id;
        }

        public get Mass(): number {
            return this._mass;
        }

        public get Position(): Graphene.Position {
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

    export class Position {
        public X: number;
        public Y: number;
    }
}