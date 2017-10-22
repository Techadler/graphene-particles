// Copyright 2017 AdlerTech
module Graphene {
    const RECORD_LENGTH: number = 1000;
    const TIME_SECOND: number = 1000;
    const DROP_THRESHOLD: number = 5 * TIME_SECOND;
    const AVERAGE_LENGTH: number = 100; // The samples over which to accumulate the average
    export class Control {
        private _frameTimes: number[] = new Array<number>(RECORD_LENGTH);
        private _frameTimesIdx: number = 0;
        private _frameCount: number = 0;
        private _physicsTimes: number[] = new Array<number>(RECORD_LENGTH);
        private _physicsTimesIdx: number = 0;
        private _physicsCount: number = 0;

        private _frameStart: number = 0;
        private _physicsStart: number = 0;

        public onFrameStart(): void {
            this._frameStart = window.performance.now();
        }

        public onFrameStop(): void {
            const now: number = window.performance.now();
            const duration: number = now - this._frameStart;
            if (this._frameStart > 0 && duration < DROP_THRESHOLD) {
                this._frameCount++;
                this._frameTimesIdx = ++this._frameTimesIdx < RECORD_LENGTH ? this._frameTimesIdx : 0;
                this._frameTimes[this._frameTimesIdx] = duration;
            }
        }

        public onPhysicsStart(): void {
            this._physicsStart = window.performance.now();
        }

        public onPhysicsStop(): void {
            const now: number = window.performance.now();
            const duration: number = now - this._physicsStart;
            if (this._physicsStart > 0 && duration < DROP_THRESHOLD) {
                this._physicsCount++;
                this._physicsTimesIdx = ++this._physicsTimesIdx < RECORD_LENGTH ? this._physicsTimesIdx : 0;
                this._physicsTimes[this._physicsTimesIdx] = duration;
            }
        }

        public onRenderStart(): void {

        }

        public onRenderStop(): void {

        }

        public get AveragePhysicsTime(): number {
            let time: number = 0;
            let times: number = 0;
            for (let i: number = 0; i < 5; ++i) {
                let idx: number = this._physicsTimesIdx - i;
                if (idx < 0) { idx = RECORD_LENGTH - idx; }
                const t: number = this._physicsTimes[idx];
                if (t != null && t > 0) {
                    times++;
                    time += t;
                }
            }
            if (times > 0) {
                return time / times;
            }
            return 0;
        }

        public get AverageFrameTime(): number {
            let time: number = 0;
            let times: number = 0;
            for (let i: number = 0; i < 5; ++i) {
                let idx: number = this._frameTimesIdx - i;
                if (idx < 0) { idx = RECORD_LENGTH - idx; }
                const t: number = this._frameTimes[idx];
                if (t != null && t > 0) {
                    times++;
                    time += t;
                }
            }
            if (times > 0) {
                return time / times;
            }
            return 0;
        }

        public get LastFrameTime(): number {
            return this._frameTimes[this._frameTimesIdx];
        }

        public get LastPhysicsTime(): number {
            return this._physicsTimes[this._physicsTimesIdx];
        }
    }
}