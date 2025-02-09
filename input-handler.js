import { TradingScreen } from './ui/trading-screen.js';

export class InputHandler {
    constructor(element, game, screen) {
        this.element = element;
        this.canDrag = false;
        this.isDragging = false;
        this.wasDragging = false;
        this.game = game;
        this.screen = screen;
        this.hasLogged = false;
        this.lastX = 0;
        this.lastY = 0;

        element.addEventListener('mousemove', function (event) {
            if (this.canDrag) {
                const dx = this.lastX - event.clientX;
                const dy = this.lastY - event.clientY;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    this.isDragging = true;
                }
            }

            if (this.isDragging) {
                const dx = event.clientX - this.lastX;
                const dy = event.clientY - this.lastY;
                this.lastX = event.clientX;
                this.lastY = event.clientY;

                screen.offset.x += dx;
                screen.offset.y += dy;

                return;
            }

            for (let i = 0; i < game.world.stations.length; i++) {
                game.world.stations[i].hovered = false;
            }

            const worldPos = screen.transformMouseToWorldPos(event.offsetX, event.offsetY);
            for (let i = 0; i < game.world.stations.length; i++) {
                if (game.world.stations[i].isHovered(worldPos)) {
                    game.world.stations[i].hovered = true;
                    break;
                }
            }
        });

        element.addEventListener('click', function (event) {
            console.log(`click (isDragging: ${this.isDragging}, wasDragging: ${this.wasDragging})`);

            if (this.wasDragging) {
                this.wasDragging = false;
                return;
            }

            const worldPos = screen.transformMouseToWorldPos(event.offsetX, event.offsetY);

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

        element.addEventListener('dblclick', function (event) {
            const worldPos = screen.transformMouseToWorldPos(event.offsetX, event.offsetY);
            for (let i = 0; i < game.world.stations.length; i++) {
                if (game.world.stations[i].isHovered(worldPos)) {
                    game.player.destination = game.world.stations[i];
                    game.player.station = null;
                    break;
                }
            }
        });

        element.addEventListener('mousedown', function (event) {
            this.canDrag = true;
            this.lastX = event.clientX;
            this.lastY = event.clientY;
        });

        element.addEventListener('mouseup', function (event) {
            this.canDrag = false;
            if (this.isDragging) {
                console.log('was dragging');
                this.wasDragging = true;
            }
            this.isDragging = false;
        });

        element.addEventListener('wheel', function (event) {
            const delta = Math.sign(event.deltaY);
            if (delta > 0) {
                screen.zoomOut();
            } else {
                screen.zoomIn();
            }

            event.preventDefault();
        });

        document.addEventListener('keydown', function (event) {
            switch (event.key) {
                case 't':
                    if (!game.player.station) {
                        return;
                    }

                    screen.active = new TradingScreen(screen, game.player, game.player.station);
                    event.preventDefault();
                    return;
                case 'r':
                    // Use fuel to refuel ship
                    game.player.refuel();
                    event.preventDefault();
                    return;

                // Left bracket cycles selected station backwards
                case '[':
                    if (!game.selectedStation) {
                        game.selectedStation = game.world.stations[game.world.stations.length - 1];
                    }

                    let si1 = game.world.stations.indexOf(game.selectedStation);
                    si1 = (si1 - 1 + game.world.stations.length) % game.world.stations.length;
                    game.selectedStation = game.world.stations[si1];
                    event.preventDefault();
                    return;

                // Right bracket cycles selected station forwards
                case ']':
                    if (!game.selectedStation) {
                        game.selectedStation = game.world.stations[0];
                    }

                    let si2 = game.world.stations.indexOf(game.selectedStation);
                    si2 = (si2 + 1) % game.world.stations.length;
                    game.selectedStation = game.world.stations[si2];
                    event.preventDefault();
                    return;


            }

            if (screen.active) {
                screen.active.handleKeyDown(event);
                return;
            }
        });

        // this.screen.active = new TradingScreen(screen, game.player, game.player.station);
    }
}