// Copyright 2016-2017 AdlerTech

module Graphene {
    export class InstanceManager {
        private static _instances: Instance[] = new Array<Instance>();

        public static createInstance(canvas: HTMLCanvasElement, config: Config, useroverlay: HTMLElement = null): Instance {
            console.log('Creating instance...');
            const i: Instance = new Instance(this.generateId(), canvas, config, useroverlay);
            this._instances.push(i);
            return i;
        }

        private static generateId(): string {
            return '1'; // TODO
        }
    }
}