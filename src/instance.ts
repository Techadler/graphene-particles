// Copyright 2016-2017 AdlerTech

module Graphene {
    export class Instance {
        private _id: string;
        private _canvas: HTMLCanvasElement;
        private _config: Config;
        private _renderer: Renderer;
        private _physics: Physics;

        private _activeAtomCount: number = 0;
        private _atoms: Atom[] = new Array<Atom>();

        private _height: number = 0;
        private _width: number = 0;

        private _loopId: number = 0;
        private _lastRunTimeStamp: number = 0;
        private _cyclesExceeded: number = 0;
        private _autoAtomLimit: number = 0;
        private _framesBetweenControl: number = 0;

        private _control: Control = new Control();

        public Links: boolean[][] = new Array<boolean[]>();

        constructor(id: string, canvas: HTMLCanvasElement, config: Config) {
            this._id = id;
            this._canvas = canvas;
            this._config = Config.parse(config);

            this.updateCanvasDimensions();

            this._renderer = new Renderer(this._canvas, this);
            this._physics = new Physics(this, this._control);

            window.addEventListener('resize', this.onWindowResize);
        }

        public start(): void {
            if (this._loopId === 0) {
                this._loopId = window.requestAnimationFrame(this.mainLoop);
            }
        }

        public stop(): void {
            if (this._loopId !== 0) {
                window.cancelAnimationFrame(this._loopId);
            }
        }

        private mainLoop = (timestamp: number): void => {
            this._control.onFrameStart();
            this.controlAtomPopulation();
            this._physics.update(timestamp);
            if (this._lastRunTimeStamp === 0 ||
                this.Config.MaxFPS === 0 ||
                this._lastRunTimeStamp < timestamp - (1000 / this.Config.MaxFPS)) {
                this._renderer.doRenderCycle();
                this._lastRunTimeStamp = timestamp;
            }
            this._loopId = window.requestAnimationFrame(this.mainLoop);
            this._control.onFrameStop();
        }

        private controlAtomPopulation(): void {
            const densityAtomCount: number = Math.round(
                this.Config.Density !== 0 ?
                    (this._width * this._height) / 1000 / this.Config.Density : 0
            );
            const maxAtoms: number = this.Config.MaxAtoms;
            const maxFrameTime: number = 1000 / this.Config.MaxFPS;
            const averageFrameTime: number = this._control.AverageFrameTime;
            const maxPhysicsTime: number = 1000 / this.Config.TPS * 0.5;
            const averagePhysicsTime: number = this._control.AveragePhysicsTime;

            let targetAtomCount: number = 0;
            if (densityAtomCount > 0 && maxAtoms > 0) {
                targetAtomCount = densityAtomCount > maxAtoms ? maxAtoms : densityAtomCount;
            } else if (densityAtomCount > 0 && maxAtoms === 0) {
                targetAtomCount = densityAtomCount;
            } else if (densityAtomCount === 0 && maxAtoms > 0) {
                targetAtomCount = maxAtoms;
            }

            if (this.Config.AutoAdjustAtomCount) {
                const atoms: number = this._activeAtomCount > 0 ? this._activeAtomCount : maxAtoms;
                if (this._control.LastFrameTime > 500) {
                    targetAtomCount = atoms * 0.2;
                    this._autoAtomLimit = targetAtomCount;
                } else if (this._framesBetweenControl <= 0 && averageFrameTime > maxFrameTime * 1.5) {
                    let f: number = maxFrameTime / averageFrameTime;
                    if (f < 0.8) { f = 0.8; }
                    targetAtomCount = Math.round(atoms * f);
                    if (targetAtomCount <= 1) { targetAtomCount = 2; }
                    this._autoAtomLimit = targetAtomCount;
                    this._framesBetweenControl = 100;
                    console.log('PopulationControl:', 'Adjusting atom count from ' + atoms + ' to ' + targetAtomCount + ' Factor is:' + f);
                    console.log('AverageFrameTime: ', averageFrameTime, 'MaxFrameTime', maxFrameTime);
                } else if (this._framesBetweenControl <= 0 && averageFrameTime > 0 && averageFrameTime < maxFrameTime * 0.5) {
                    let f: number = maxFrameTime / averageFrameTime;
                    if (f > 1.2) { f = 1.2; }
                    targetAtomCount = Math.round(atoms * f);
                    if (targetAtomCount - atoms > 250) { targetAtomCount = atoms + 250; }
                    if (targetAtomCount <= 1) { targetAtomCount = 2; }
                    this._autoAtomLimit = targetAtomCount;
                    this._framesBetweenControl = 100;
                    console.log('PopulationControl:', 'Adjusting atom count from ' + atoms + ' to ' + targetAtomCount + ' Factor is:' + f);
                    console.log('AverageFrameTime: ', averageFrameTime, 'MaxFrameTime', maxFrameTime);
                } else {
                    targetAtomCount = this._autoAtomLimit;
                }
                this._framesBetweenControl--;
            }

            if (this._atoms.length < targetAtomCount) {
                this._atoms.length = targetAtomCount;
            } else if (this._atoms.length > targetAtomCount) {
                this._atoms.splice(targetAtomCount, this._atoms.length - targetAtomCount);
            }
            for (let i: number = 0; i < this._atoms.length; ++i) {
                if (this._atoms[i] == null) {
                    // tslint:disable-next-line:max-line-length
                    this._atoms[i] = new Atom(i, this.Config.AtomMinSize, this.Config.AtomMaxSize, this.getRandomPosition(), this.getRandomVector());
                }
            }
            this._activeAtomCount = this._atoms.length;
        }

        private getRandomPosition(): Position {
            return { X: Math.random() * this.Width, Y: Math.random() * this.Height };
        }

        private getRandomVector(): Vector {
            const v: Vector = new Vector(1, 1).scaleTo(Math.random() * 200);
            return v.rotate(Math.random() * 2 * Math.PI);
        }

        private updateCanvasDimensions(): void {
            const c: Config = this._config;
            const p: HTMLElement = this._canvas.parentElement;
            if (c.Width === 0) {
                if (c.MaxWidth > 0) {
                    this._width = p.clientWidth > c.MaxWidth ? c.MaxWidth : p.clientWidth;
                } else {
                    this._width = p.clientWidth;
                }
            } else {
                this._width = c.Width;
            }
            if (c.Height === 0) {
                if (c.MaxHeight > 0) {
                    this._height = p.clientHeight > c.MaxHeight ? c.MaxHeight : p.clientHeight;
                } else {
                    this._height = p.clientHeight;
                }
            } else {
                this._height = c.Height;
            }
            this._canvas.setAttribute('width', this._width.toString(10));
            this._canvas.setAttribute('height', this._height.toString(10));
        }

        private onWindowResize = (ev: UIEvent): void => {
            this.updateCanvasDimensions();
        }

        public get Config(): Config {
            return this._config;
        }

        public get Atoms(): Array<Atom> {
            return this._atoms;
        }

        public get Physics(): Physics {
            return this._physics;
        }

        public get Height(): number {
            return this._height;
        }
        public get Width(): number {
            return this._width;
        }
    }

    export class Dimensions {
        public Width: number;
        public Height: number;
    }
}