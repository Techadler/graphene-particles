// Copyright 2016-2017 AdlerTech

module Graphene {
    export class Renderer {
        private _canvas: HTMLCanvasElement;
        private _ctx: CanvasRenderingContext2D;
        private _instance: Instance;

        constructor(canvas: HTMLCanvasElement, instance: Instance) {
            this._canvas = canvas;
            this._ctx = canvas.getContext('2d', { alpha: instance.Config.AlphaBackground });
            this._instance = instance;
        }

        public doRenderCycle(): void {
            this.drawBackground();
            if (this._instance.Config.DrawQuadTree) { this.drawQuadTree(); }
            this.applyOcclusionCulling();
            if (this._instance.Config.MaxEdgeLength > 0) { this.drawLinks(); }
            this.drawAtoms();
        }

        private applyOcclusionCulling(): void {
            for (const atom of this._instance.Atoms) {
                if ((atom.Size + atom.Position.X < 0 || atom.Position.X - atom.Size > this._instance.Width)
                    && (atom.Size + atom.Position.Y < 0 || atom.Position.Y - atom.Size > this._instance.Height)) {
                    atom.Visible = false;
                } else {
                    atom.Visible = true;
                }
            }
        }

        private drawAtoms(): void {
            const atomBorderColor: string = this._instance.Config.AtomBorderColor;
            const atomColor: string = this._instance.Config.AtomColor;

            // Because fill seems to be magnitudes faster than stroke fill border and inner
            // First draw `Border` below atom then draw atom inner color
            for (const atom of this._instance.Atoms) {
                if (!atom.Visible) { continue; }
                this._ctx.fillStyle = atomBorderColor;
                this._ctx.beginPath();
                this._ctx.arc(atom.Position.X, atom.Position.Y, atom.Size, 0, Math.PI * 2);
                this._ctx.fill();
                this._ctx.fillStyle = atomColor;
                this._ctx.beginPath();
                this._ctx.arc(atom.Position.X, atom.Position.Y, atom.Size - 1.5, 0, Math.PI * 2);
                this._ctx.fill();
            }

        }

        private drawBackground(): void {
            const i: Instance = this._instance;
            this._ctx.clearRect(0, 0, i.Width, i.Height);
            this._ctx.fillStyle = i.Config.BackgroundColor;
            this._ctx.fillRect(0, 0, i.Width, i.Height);
        }

        private drawLinks(): void {
            const len: number = this._instance.Atoms.length;
            const links: boolean[][] = this._instance.Links;
            for (const a1 of this._instance.Atoms) {
                if (a1.Links > 0) {
                    for (let i: number = a1.Id + 1; i < len; ++i) {
                        const a2: Atom = this._instance.Atoms[i];
                        if (links[a1.Id][a2.Id] && (a1.Visible || a2.Visible)) {
                            this.drawLink(a1, a2);
                        }
                    }
                }
            }
        }

        private drawLink(atom1: Atom, atom2: Atom): void {
            const dist: number = atom1.distanceTo(atom2);
            const v: Vector = Vector.fromAtoms(atom1, atom2);
            const p1: Position = { X: atom1.Position.X, Y: atom1.Position.Y };
            const p2: Position = { X: atom2.Position.X, Y: atom2.Position.Y };
            const v1: Vector = v.scaleTo(atom1.Size); p1.X += v1.X; p1.Y += v1.Y;
            const v2: Vector = v.invert().scaleTo(atom2.Size); p2.X += v2.X; p2.Y += v2.Y;
            let fac: number = (1 - (dist * dist) / Math.pow(this._instance.Config.MaxEdgeLength, 2));
            if (fac < 0) { fac = 0; }
            this._ctx.lineWidth = this._instance.Config.EdgeWidth * fac;
            this._ctx.strokeStyle = this._instance.Config.EdgeColor;
            this._ctx.beginPath();
            this._ctx.moveTo(p1.X, p1.Y);
            this._ctx.lineTo(p2.X, p2.Y);
            this._ctx.stroke();
        }

        private drawQuadTree(tree: QuadTree = this._instance.Physics.QuadTree): void {
            this._ctx.font = '14px Arial';
            this._ctx.textAlign = 'center';
            this._ctx.fillStyle = '#ff00f2';
            if (tree !== null) {
                if (tree.IsSplit) {
                    const b: Rectangle = tree.Bounds;
                    // const c: Color = Color.fromHSV(120 + 40 * tree.Level, 1, 1);
                    this._ctx.strokeStyle = '#ff00f2'; // c.toRGBString();
                    this._ctx.lineWidth = 1;
                    { // Draw our split axis
                        this._ctx.beginPath();
                        this._ctx.moveTo(b.XMid, b.Y1);
                        this._ctx.lineTo(b.XMid, b.Y2);
                        this._ctx.stroke();
                        this._ctx.beginPath();
                        this._ctx.moveTo(b.X1, b.YMid);
                        this._ctx.lineTo(b.X2, b.YMid);
                        this._ctx.stroke();
                    }
                    this._ctx.fillText('Spares:' + tree.Spares, b.XMid, b.YMid);
                    for (const sector of tree.Sectors) {
                        this.drawQuadTree(sector);
                    }
                } else {
                    this._ctx.fillText('Objects:' + tree.Objects, tree.Bounds.XMid, tree.Bounds.YMid);
                }
            }
        }
    }
}