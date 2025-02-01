// @ts-nocheck

import { Vector2 } from './Vector2.js';

export class UiButton {
    constructor(pos, size = new Vector2(50, 20), data = {}) {
        this.pos = new Vector2(pos.x, pos.y);
        this.size = size;
        this.color = 'blue';
        this.data = data;
        this.text = 'Button';
        this.isVisible = true;
        this.type = "button";
    }

    isInside(pos) {
        return pos.x >= this.pos.x && pos.x <= this.pos.x + this.size.x &&
            pos.y >= this.pos.y && pos.y <= this.pos.y + this.size.y;
    }

    render(ctx) {
        if (!this.isVisible) {
            return;
        }
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        const textMetrics = ctx.measureText(this.data.text);


        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.pos.x + 5, this.pos.y + this.size.y / 2);
    }
}