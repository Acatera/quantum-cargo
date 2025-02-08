// @ts-nocheck

import { Inventory } from './inventory.js';
import { itemsTypes } from './item-types.js';

export class SpaceStation {
    constructor(pos, name, size = 5, color = 'white') {
        this.id = Math.random().toString(36);
        this.pos = pos;
        this.name = name || this._generateSpaceStationName();
        this.size = size;
        this.color = color;
        this.processed = false;
        this.inventory = new Inventory();
        this.hovered = false;
        this.selected = false;
        this._buyingCoefficient = 0.8;
        this._sellingCoefficient = 1.2;

        const initialInventoryItems = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < initialInventoryItems; i++) {

            let itemCount = Math.floor(Math.random() * 10) + 1;
            let itemTypesCount = Object.keys(itemsTypes).length;
            let itemId = Math.floor(Math.random() * itemTypesCount) + 1;
            this.inventory.add(itemId, itemCount);
        }
    }

    _generateSpaceStationName() {
        const prefixes = [
            "Lunar", "Neptune", "Vega", "Orion", "Apollo", "Ares", "Zeus",
            "Quantum", "Nova", "Sol", "Astro", "Titan", "Cosmo", "Celestial"
        ];

        const coreNames = [
            "Echo", "Prometheus", "Zenith", "Pioneer", "Horizon", "Eclipse",
            "Sentinel", "Oasis", "Halcyon", "Odyssey", "Vanguard", "Nebula",
            "Hyperion", "Exodus", "Genesis", "Oblivion"
        ];

        const suffixes = [
            "Station", "Outpost", "Base", "Hub", "Dock", "Port",
            "Lab", "Observatory", "Array", "Fort", "Bastion", "Forge",
            "Citadel", "Colony", "Waypoint"
        ];

        // Generate a random number for potential serial usage
        const serial = Math.floor(Math.random() * 100) + 1;

        // Randomly select components
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const core = coreNames[Math.floor(Math.random() * coreNames.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        // Decide whether to add a serial number (50% chance)
        const includeSerial = Math.random() > 0.5;

        return includeSerial ? `${prefix} ${core} ${suffix}-${serial}` : `${prefix} ${core} ${suffix}`;
    }

    isHovered(mousePos) {
        const distance = this.pos.sub(mousePos).magnitude();
        return distance < this.size;
    }

    getUnitBuyPrice(itemId) {
        const item = Object.values(itemsTypes).find(item => item.id === itemId);
        const price = Math.round(item.value * this._buyingCoefficient);
        console.log(`Buying ${item.name} for ${price}`);
        return price;
    }

    getUnitSellPrice(itemId) {
        const item = Object.values(itemsTypes).find(item => item.id === itemId);
        const price = Math.round(item.value * this._sellingCoefficient);
        console.log(`Selling ${item.name} for ${price}`);
        return price;
    }
}