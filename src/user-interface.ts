// Copyright 2017 AdlerTech

/// <reference path="types/point.ts" />

module Graphene {
    export class UserInterface {
        private _instance: Graphene.Instance;
        private _pendingMouseAction: MouseAction = MouseAction.NONE;
        private _mouseDown: boolean = false;
        private _mousePosition: MousePosition = new MousePosition();
        private _lastMousePosition: MousePosition = new MousePosition();
        private _mouseMove: Vector = new Vector();
        private _canvas: HTMLCanvasElement;
        private _boundElement: HTMLElement;
        private _focusedAtom: Atom = null;

        constructor(instance: Graphene.Instance, canvas: HTMLCanvasElement) {
            console.log('Constructing User Interface');
            this._instance = instance;
            this._canvas = canvas;
        }

        public bindTo(element: HTMLElement): void {
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
        }

        public onUpdateCycle(physics: Physics): void {
            const targetedAtom: Atom = this.findTargetedAtom(physics.QuadTree, this.MousePosition);
            if (this._pendingMouseAction === MouseAction.CLICK) {
                // Find atom and do physics lock
                if (targetedAtom != null) {
                    this._focusedAtom = targetedAtom;
                    this._focusedAtom.PhysicsLocked = true;
                    const vector: Vector = Vector.fromPoints(this._lastMousePosition, this._mousePosition);
                    this._focusedAtom.Vector = vector.scaleBy(1000 / (this.MousePosition.Time - this._lastMousePosition.Time));
                    this._boundElement.style.cursor = 'move';
                }
            } else if (this._pendingMouseAction === MouseAction.RELEASE) {
                // If has atom, set atom vector and relase physics lock
                if (this._focusedAtom != null) {
                    this._focusedAtom.PhysicsLocked = false;
                    // Set Vector
                    const vector: Vector = Vector.fromPoints(this._lastMousePosition, this._mousePosition);
                    this._focusedAtom.Vector = vector.scaleBy(1000 / (this.MousePosition.Time - this._lastMousePosition.Time));
                    this._focusedAtom = null;
                }
                this._boundElement.style.cursor = 'default';
            } else if (this._mouseDown && this._focusedAtom != null) {
                // Update Atom position
                this._focusedAtom.Position.X = this.MousePosition.X;
                this._focusedAtom.Position.Y = this.MousePosition.Y;
                this._boundElement.style.cursor = 'move';
            } else {
                // Update cursor
                this._boundElement.style.cursor = targetedAtom != null ? 'pointer' : 'default';
            }

            this._pendingMouseAction = MouseAction.NONE;
        }

        private findTargetedAtom(quadTree: QuadTree, point: Point): Atom {
            for (const atom of quadTree.getItems(point.X, point.Y)) {
                if (Math.abs(atom.Position.X - point.X) < atom.Size + 2 && Math.abs(atom.Position.Y - point.Y) < atom.Size + 2) {
                    return atom;
                }
            }
            return null;
        }

        private onMouseDown = (event: MouseEvent): void => {
            this._mouseDown = true;
            this._mousePosition.X = this.translateX(event.clientX);
            this._mousePosition.Y = this.translateY(event.clientY);
            this._mousePosition.updateRecordTime();
            this._pendingMouseAction = MouseAction.CLICK;
        }

        private onMouseMove = (event: MouseEvent): void => {
            this._lastMousePosition.X = this.MousePosition.X;
            this._lastMousePosition.Y = this.MousePosition.Y;
            this._lastMousePosition.updateRecordTime(this.MousePosition.Time);
            this._mousePosition.X = this.translateX(event.clientX);
            this._mousePosition.Y = this.translateY(event.clientY);
            this._mousePosition.updateRecordTime();
        }

        private onMouseUp = (event: MouseEvent): void => {
            this._mousePosition.X = this.translateX(event.clientX);
            this._mousePosition.Y = this.translateY(event.clientY);
            this._mousePosition.updateRecordTime();
            this._mouseDown = false;
            this._pendingMouseAction = MouseAction.RELEASE;
        }

        private translateX(x: number): number {
            const canvasRect: ClientRect = this._canvas.getBoundingClientRect();
            return x - canvasRect.left;
        }
        private translateY(y: number): number {
            const canvasRect: ClientRect = this._canvas.getBoundingClientRect();
            return y - canvasRect.top;
        }

        public get MousePosition(): MousePosition {
            return this._mousePosition;
        }

        public get MouseDown(): boolean {
            return this._mouseDown;
        }
    }

    export enum MouseAction {
        NONE,
        CLICK,
        RELEASE
    }

    export class MousePosition extends Point {
        private _timestamp: number = 0;

        constructor(x: number = 0, y: number = 0) {
            super(x, y);
            this.updateRecordTime();
        }

        public updateRecordTime(timestamp: number = 0): void {
            if (timestamp === 0) {
                this._timestamp = Date.now();
            } else {
                this._timestamp = timestamp;
            }
        }

        public get Time(): number {
            return this._timestamp;
        }
    }
}