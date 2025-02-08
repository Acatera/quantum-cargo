import { Vector2 } from './vector2.js';
import { Inventory } from './inventory.js';
import { World } from './world.js';
import { itemsTypes } from './item-types.js';

export class Game {
    constructor() {
        const fuelFillPerUnit = 10;
        this.player = {
            inventory: new Inventory(),
            credits: 10,
            location: new Vector2(0, 0),
            destination: null,
            station: null,
            ship: {
                name: 'Starship',
                maxFuel: 100,
                maxCargo: 100,
                fuel: 100,
                consumption: 1,
                speed: 5,
                refuel(amount) {
                    this.fuel = Math.min(this.maxFuel, this.fuel + amount);
                }
            },
            refuel() {
                const fuelUsed = this.ship.maxFuel - this.ship.fuel;
                if (fuelUsed < fuelFillPerUnit) {
                    console.warn('Did not use enough fuel to refuel');
                    return;
                }

                const unitsOfFuelNeeded = Math.ceil(fuelUsed / fuelFillPerUnit);
                const unitsOfFuelOwned = this.inventory.count(itemsTypes.fuel.id);

                const unitsOfFuelUsed = Math.min(unitsOfFuelNeeded, unitsOfFuelOwned);

                console.info('Refueling with', unitsOfFuelUsed, 'units of fuel');
                this.ship.refuel(unitsOfFuelUsed * fuelFillPerUnit);
                this.inventory.remove(itemsTypes.fuel.id, unitsOfFuelUsed);
            }
        };
        this.selectedStation = null;
        this.selectedItemIndex = null;
        this.world = new World(600, 600);

        // this.player.station = this.world.stations[0];
        this.player.inventory.add(itemsTypes.food.id, 100);
        this.player.inventory.add(itemsTypes.ore.id, 10);
        this.player.inventory.add(itemsTypes.fuel.id, 1);
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
                this.player.station = this.selectedStation;

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