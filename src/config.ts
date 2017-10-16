// Copyright 2016-2017 AdlerTech

module Graphene {
    export class Config {
        // Performance
        public AutoAdjustAtomCount: boolean = true;
        public Density: number = 0.5;
        public MaxAtoms: number = 1000;
        public MaxLinkLength: number = 0;
        public MaxLinksPerAtom: number = 4;
        // Renderer
        public AlphaBackground: boolean = false;
        public DrawLinks: boolean = false;
        public DrawQuadTree: boolean = false;
        public LinkWidth: number = 1.5;
        public AtomMinSize: number = 4;
        public AtomMaxSize: number = 8;
        public MaxFPS: number = 60;
        // Colors
        public BackgroundColor: string;
        public LinkColor: string;
        public AtomColor: string;
        public AtomBorderColor: string;
        // Dimensions
        public Height: number = 0;
        public Width: number = 0;
        public MaxHeight: number = 0;
        public MaxWidth: number = 0;
        // Physics
        public TPS: number = 60;
        public Gravity: Vector = { X: 0, Y: 0 } as Vector;
        public AtomCollisions: boolean = true;
        public WallCollisions: boolean = true;
        public WallFriction: number = 0.9; // How much energy is preserved when bouncing atoms at walls
        public AtomFriction: number = 0.9; // How much energy is preserved when colliding atoms
    }
}