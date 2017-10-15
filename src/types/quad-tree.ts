// Copyright 2016-2017 AdlerTech

module Graphene {
    const MAX_LEVEL: number = 5;
    const MAX_OBJECTS: number = 10;

    export class QuadTree {
        private _bounds: Rectangle;
        private _level: number;
        private _objects: Atom[] = new Array<Atom>();
        private _spares: Atom[] = new Array<Atom>();
        private _sectors: QuadTree[];
        private _isSplit: boolean = false;

        constructor(level: number, rect: Rectangle) {
            this._level = level;
            this._bounds = rect;
        }

        public addItem(atom: Atom): void {
            if (!this._isSplit) {
                if (this._objects.length > MAX_OBJECTS && this._level < MAX_LEVEL) {
                    this.split();
                    this.addItem(atom);
                } else {
                    this._objects.push(atom);
                }
            } else {
                if (this.isSpare(atom)) {
                    this._spares.push(atom);
                } else {
                    const sector: QuadTree = this.getSector(atom.Position.X, atom.Position.Y);
                    sector.addItem(atom);
                }
            }
        }

        public addItems(atoms: Atom[]): void {
            for (const p of atoms) {
                this.addItem(p);
            }
        }

        public getItems(x: number, y: number): Atom[] {
            if (this._isSplit) {
                const sec: QuadTree = this.getSector(x, y);
                const res: Atom[] = sec.getItems(x, y);
                return res.concat(this._spares);
            } else {
                return this._objects;
            }
        }

        private getSector(x: number, y: number): QuadTree {
            /* Sectors are placed this way:
            1 | 2
            --|--
            4 | 3
            */
            let secId: number = 0;
            if (x > this._bounds.X1 && x < this._bounds.XMid) {
                if (y > this._bounds.Y1 && y < this._bounds.YMid) {
                    secId = 0;
                } else {
                    secId = 3;
                }
            } else {
                if (y > this._bounds.Y1 && y < this._bounds.YMid) {
                    secId = 1;
                } else {
                    secId = 2;
                }
            }
            return this._sectors[secId];
        }

        private isSpare(atom: Atom): boolean {
            const spareDist: number = atom.Size;
            if (atom.Position.X >= this._bounds.XMid - spareDist && atom.Position.X <= this._bounds.XMid + spareDist) {
                return true;
            }
            if (atom.Position.Y >= this._bounds.YMid - spareDist && atom.Position.Y <= this._bounds.YMid + spareDist) {
                return true;
            }
            return false;
        }

        private split(): void {
            if (!this._isSplit) {
                this._sectors = new Array<QuadTree>(4);
                const b: Rectangle = this._bounds;
                this._sectors[0] = new QuadTree(this._level + 1, new Rectangle(b.X1, b.Y1, b.XMid, b.YMid));
                this._sectors[1] = new QuadTree(this._level + 1, new Rectangle(b.XMid, b.Y1, b.X2, b.YMid));
                this._sectors[2] = new QuadTree(this._level + 1, new Rectangle(b.XMid, b.YMid, b.X2, b.Y2));
                this._sectors[3] = new QuadTree(this._level + 1, new Rectangle(b.X1, b.YMid, b.XMid, b.Y2));

                for (const obj of this._objects) {
                    if (this.isSpare(obj)) {
                        this._spares.push(obj);
                    } else {
                        const sec: QuadTree = this.getSector(obj.Position.X, obj.Position.Y);
                        sec.addItem(obj);
                    }
                }
                this._objects = [];
            }
            this._isSplit = true;
        }

        public get Bounds(): Rectangle {
            return this._bounds;
        }
        public get IsSplit(): boolean {
            return this._isSplit;
        }
        public get Level(): number {
            return this._level;
        }
        public get Objects(): number {
            return this._objects.length;
        }
        public get Spares(): number {
            return this._spares.length;
        }
        public get Sectors(): QuadTree[] {
            return this._sectors;
        }
    }

    export class Rectangle {
        private _x1: number;
        private _x2: number;
        private _xMid: number;
        private _y1: number;
        private _y2: number;
        private _yMid: number;

        constructor(x1: number, y1: number, x2: number, y2: number) {
            this._x1 = x1;
            this._x2 = x2;
            this._xMid = Math.floor(x2 - x1) / 2 + x1;
            this._y1 = y1;
            this._y2 = y2;
            this._yMid = Math.floor(y2 - y1) / 2 + y1;
        }

        public get X1(): number {
            return this._x1;
        }
        public get X2(): number {
            return this._x2;
        }
        public get XMid(): number {
            return this._xMid;
        }
        public get Y1(): number {
            return this._y1;
        }
        public get Y2(): number {
            return this._y2;
        }
        public get YMid(): number {
            return this._yMid;
        }
    }
}