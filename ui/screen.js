import { Vector2 } from '../vector2.js';

export class Screen {
    constructor(canvas) {
        this.canvas = canvas;
        this.zoom = 1;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.zoomSpeed = 0.05;

        this.renderer = null;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.offset = new Vector2(this.width / 2, this.height / 2);

        this.setupCanvas();


        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }

    zoomIn() {
        this.zoom += this.zoomSpeed;
        if (this.zoom > 2) {
            this.zoom = 2;
        }
    }

    zoomOut() {
        this.zoom -= this.zoomSpeed;
        if (this.zoom < 0.4) {
            this.zoom = 0.4;
        }
    }

    setupCanvas() {
        const canvas = document.getElementById("screen");
        const ctx = canvas.getContext("2d");

        // Get the device pixel ratio (DPR) for high-DPI screens
        const dpr = window.devicePixelRatio || 1;

        // Set canvas size to match window size
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Adjust for high-DPI displays
        canvas.width = this.width * dpr;
        canvas.height = this.height * dpr;
        canvas.style.width = `${this.width}px`;
        canvas.style.height = `${this.height}px`;

        // Scale the context for crisp rendering
        ctx.scale(dpr, dpr);

        this.devicePixelRatio = dpr;
        this.context = ctx;
    }

    transformMouseToWorldPos(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = x - rect.left;
        const mouseY = y - rect.top;
        return new Vector2(mouseX, mouseY)
            .sub(this.offset)
            .scale(1 / this.zoom)
    }

    transformToScreenPos(pos) {
        return pos
            .scale(this.zoom)
            .add(this.offset)
    }
}   