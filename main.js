// @ts-nocheck

import { Renderer } from './ui/renderer.js';
import { Vector2 } from './vector2.js';
import { Game } from './game.js';

const SCALE_FACTOR = 0.05;

const game = new Game();

const canvas = document.getElementById('screen');

// Required for the canvas to fill the entire screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let WORLD_WIDTH = canvas.width;
let WORLD_HEIGHT = canvas.height;

const devicePixelRatio = 1 / window.devicePixelRatio || 1;
const ctx = canvas.getContext('2d');
ctx.scale(devicePixelRatio, devicePixelRatio);

const renderer = new Renderer(ctx, game);

function revertProcessingMark(stations) {
    for (let i = 0; i < stations.length; i++) {
        stations[i].processed = false;
    }
}

function findNearestStation(station, stations) {
    let nearestStation = null;
    let nearestDistance = Infinity;
    for (let i = 0; i < stations.length; i++) {
        const otherStation = stations[i];
        if (otherStation.processed) {
            continue;
        }

        const distance = station.pos.sub(otherStation.pos).magnitude();
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestStation = otherStation;
        }
    }

    return nearestStation;
}

function connectStations(ctx, stations) {
    let currentStation = stations[0];
    currentStation.processed = true;
    let nextStation = findNearestStation(currentStation, stations);
    while (nextStation) {
        const from = currentStation.pos.scale(game.screen.scale);
        const to = nextStation.pos.scale(game.screen.scale);
        drawLine(ctx, from, to, 'orange');
        currentStation = nextStation;
        currentStation.processed = true;
        nextStation = findNearestStation(currentStation, stations);
    }
}

// Handle resizing the window
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    WORLD_WIDTH = canvas.width;
    WORLD_HEIGHT = canvas.height;
});

// When mouse moves over a station, highlight it and show its name
// When mouse moves out of a station, remove the highlight and hide the name
// end
document.getElementById('screen').addEventListener('mousemove', function (event) {
    if (canDrag) {
        const dx = lastX - event.clientX;
        const dy = lastY - event.clientY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging = true;
        }
    }

    if (isDragging) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;

        game.screen.offset.x += dx;
        game.screen.offset.y += dy;

        return;
    }

    for (let i = 0; i < game.world.stations.length; i++) {
        game.world.stations[i].hovered = false;
    }

    const x = event.clientX;
    const y = event.clientY;
    const rect = canvas.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;
    const mousePos = new Vector2(mouseX, mouseY).scale(1 / devicePixelRatio);
    const worldPos = mousePos
        .scale(1 / game.screen.scale)
        .sub(game.screen.offset.scale(1 / game.screen.scale));

    for (let i = 0; i < game.world.stations.length; i++) {
        if (game.world.stations[i].isHovered(worldPos)) {
            game.world.stations[i].hovered = true;
            break;
        }
    }
});

// When a station is clicked, mark it as selected
document.getElementById('screen').addEventListener('click', function (event) {
    console.log(`click (isDragging: ${isDragging}, wasDragging: ${wasDragging})`);

    if (wasDragging) {
        wasDragging = false;
        return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const rect = canvas.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;
    const mousePos = new Vector2(mouseX, mouseY).scale(1 / devicePixelRatio);
    const worldPos = mousePos
        .scale(1 / game.screen.scale)
        .sub(game.screen.offset.scale(1 / game.screen.scale));

    let hitSomething = false;
    for (let i = 0; i < game.world.stations.length; i++) {
        if (game.world.stations[i].isHovered(worldPos)) {
            game.selectedStation = game.world.stations[i];
            hitSomething = true;
            break;
        }
    }

    if (!hitSomething) {
        game.selectedStation = null;
    }

    if (game.selectedStation) {
        game.selectedItemIndex = 0;
    }
});

// When a station is double clicked, set it as the player's destination
document.getElementById('screen').addEventListener('dblclick', function (event) {
    const x = event.clientX;
    const y = event.clientY;
    const rect = canvas.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;
    const mousePos = new Vector2(mouseX, mouseY)
        .scale(1 / devicePixelRatio);
    const worldPos = mousePos
        .scale(1 / game.screen.scale)
        .sub(game.screen.offset.scale(1 / game.screen.scale));

    for (let i = 0; i < game.world.stations.length; i++) {
        if (game.world.stations[i].isHovered(worldPos)) {
            game.player.destination = game.world.stations[i];
            break;
        }
    }
});

// When dragging the mouse, alter game screen offset
let isDragging = false;
let canDrag = false;
let wasDragging = false;
let lastX = 0;
let lastY = 0;
document.getElementById('screen').addEventListener('mousedown', function (event) {
    canDrag = true;
    lastX = event.clientX;
    lastY = event.clientY;
});

document.getElementById('screen').addEventListener('mouseup', function (event) {
    canDrag = false;
    if (isDragging) {
        console.log('was dragging');
        wasDragging = true;
    }
    isDragging = false;
});

// When the mouse wheel is scrolled, zoom in or out
document.getElementById('screen').addEventListener('wheel', function (event) {
    const delta = Math.sign(event.deltaY);
    if (delta > 0) {
        game.screen.scale -= SCALE_FACTOR;
    } else {
        game.screen.scale += SCALE_FACTOR;
    }

    if (game.screen.scale < 0.1) {
        game.screen.scale = 0.1;
    } else if (game.screen.scale > 2) {
        game.screen.scale = 2;
    }

    event.preventDefault();
});

// On key press. Arrows control game.screen.offset
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 't':
            game.screen.active = new TradingScreen(game);
            event.preventDefault();
            break;
    }
});

game.screen.offset.x = WORLD_WIDTH / 2;
game.screen.offset.y = WORLD_HEIGHT / 2;

function tick(game) {
    if (game.player.destination) {
        // Check player fuel
        if (game.player.ship.fuel <= 0) {
            game.player.destination = null;
            return;
        }

        const delta = game.player.destination.pos.sub(game.player.location);
        const distance = delta.magnitude();
        if (distance < 5) {
            // Snap to the station
            game.player.location = game.player.destination.pos.clone();

            game.player.destination = null;
        } else {
            const angle = Math.atan2(delta.y, delta.x);

            const dx = Math.cos(angle) * game.player.ship.speed;
            const dy = Math.sin(angle) * game.player.ship.speed;

            game.player.location.x += dx;
            game.player.location.y += dy;

            game.player.ship.fuel -= game.player.ship.consumption;
        }
    }
}

function render() {
    renderer.render();

    requestAnimationFrame(render);
}


render();

setInterval(() => {
    tick(game);
}, 1000 / 60);