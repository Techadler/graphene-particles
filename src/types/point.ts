// Copyright 2017 AdlerTech
module Graphene {
    export class Point {
        private _x: number;
        private _y: number;

        constructor(x: number = 0, y: number = 0) {
            this._x = x;
            this._y = y;
        }

        public clone(): Point {
            return new Point(this._x, this._y);
        }

        public get X(): number {
            return this._x;
        }
        public set X(value: number) {
            this._x = value;
        }
        public get Y(): number {
            return this._y;
        }
        public set Y(value: number) {
            this._y = value;
        }
    }
}