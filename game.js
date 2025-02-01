import { Vector2 } from './vector2.js';
import { Inventory } from './inventory.js';
import { World } from './world.js';

export class Game {
    constructor() {
        this.player = {
            inventory: new Inventory(),
            credits: 10000,
            location: new Vector2(0, 0),
            destination: null,
            ship: {
                name: 'Starship',
                maxFuel: 100,
                maxCargo: 100,
                fuel: 100,
                consumption: 1,
                speed: 5,
            }
        };
        this.selectedStation = null;
        this.selectedItemIndex = null;
        this.world = new World(600, 600);
    }

    tick() {
        if (this.player.destination) {
            // Check player fuel
            if (this.player.ship.fuel <= 0) {
                this.player.destination = null;
                return;
            }

            const delta = this.player.destination.pos.sub(this.player.location);
            const distance = delta.magnitude();
            if (distance < 5) {
                // Snap to the station
                this.player.location = this.player.destination.pos.clone();

                this.player.destination = null;
            } else {
                const angle = Math.atan2(delta.y, delta.x);

                const dx = Math.cos(angle) * this.player.ship.speed;
                const dy = Math.sin(angle) * this.player.ship.speed;

                this.player.location.x += dx;
                this.player.location.y += dy;

                this.player.ship.fuel -= this.player.ship.consumption;
            }
        }
    }
}