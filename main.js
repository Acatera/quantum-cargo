// @ts-nocheck

import { Renderer } from './ui/renderer.js';
import { Game } from './game.js';
import { Screen } from './ui/screen.js';
import { InputHandler } from './input-handler.js';

const canvas = document.getElementById('screen');

const game = new Game();
const screen = new Screen(canvas);
const renderer = new Renderer(screen, game);
const inputHandler = new InputHandler(canvas, game, screen);

// When resizing the window, call screen.setupCanvas
window.addEventListener('resize', function () {
    screen.setupCanvas();
});

function render() {
    renderer.render();
    requestAnimationFrame(render);
}

render();

setInterval(() => {
    game.tick();
}, 1000 / 60);