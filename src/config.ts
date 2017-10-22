// Copyright 2016-2017 AdlerTech

module Graphene {
    export class Config {
        // Performance
        public AutoAdjustAtomCount: boolean = true;
        public Density: number = 0.5;
        public MaxAtoms: number = 200;
        public MaxLinkLength: number = 150;
        public MaxLinksPerAtom: number = 0;
        // Renderer
        public AlphaBackground: boolean = false;
        public DrawLinks: boolean = true;
        public DrawQuadTree: boolean = false;
        public LinkWidth: number = 1.5;
        public AtomMinSize: number = 4;
        public AtomMaxSize: number = 8;
        public MaxFPS: number = 60;
        // Colors
        public BackgroundColor: string = undefined;
        public LinkColor: string = undefined;
        public AtomColor: string | string[] = undefined;
        public AtomBorderColor: string = undefined;
        // Dimensions
        public Height: number = 0;
        public Width: number = 0;
        public MaxHeight: number = 0;
        public MaxWidth: number = 0;
        // Physics
        public TPS: number = 60;
        public ElectricalForce: number = 0; // electrical force constant, acts between atoms. (1000 is a good value)
        public Gravity: Vector = { X: 0, Y: 0 } as Vector; // Applies force to all atoms
        public AtomCollisions: boolean = true;
        public WallCollisions: boolean = true;
        public WallFriction: number = 0.9; // How much energy is preserved when bouncing atoms at walls
        public AtomFriction: number = 0.9; // How much energy is preserved when colliding atoms

        public static parse(config: Config): Config {
            const c: Config = new Config();
            console.log('Parsing config: ' + JSON.stringify(config));
            // tslint:disable-next-line:forin
            for (const key in c) {
                if (c.hasOwnProperty(key) && config[key] != null) {
                    const value: any = config[key];
                    if (key === 'AtomColor') {
                        if (value.constructor === Array.constructor) {
                            c[key] = value;
                        } else {
                            c[key] = [value];
                        }
                    } else {
                        console.log('Setting value ' + key + ' : ' + value);
                        c[key] = value;
                    }
                }
            }
            return c;
        }
    }
}