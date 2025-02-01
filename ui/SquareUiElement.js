
// @ts-nocheck

import { Vector2 } from "../Vector2.js";

export class SquareUiElement {
    constructor(pos, size, data, type) {
        this.pos = new Vector2(pos.x, pos.y);
        this.size = size;
        this.data = data;
        this.type = type;
    }

    isInside(pos) {
        return pos.x >= this.pos.x && pos.x <= this.pos.x + this.size.x &&
            pos.y >= this.pos.y && pos.y <= this.pos.y + this.size.y;
    }
}
