import { Vector2 } from './vector2.js';
import { Inventory } from './inventory.js';
import { World } from './world.js';

export class Game {
    constructor() {
        this.screen = {
            offset: new Vector2(0, 0),
            scale: 1
        };
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
}