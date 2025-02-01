// @ts-nocheck

import { Vector2 } from "./vector2.js";

export class RoundUiElement {
    constructor(pos, radius, data, type) {
        this.pos = new Vector2(pos.x, pos.y);
        this.radius = radius;
        this.data = data;
        this.type = type;
    }

    isInside(pos) {
        const dx = pos.x - this.pos.x;
        const dy = pos.y - this.pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius;
    }
}
