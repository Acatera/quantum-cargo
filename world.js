import { Vector2 } from './vector2.js';
import { SpaceStation } from './space-station.js';

export class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stations = [];

        this.generateStations();
    }

    generateStations() {
        let orbitCount = Math.random() * 4 + 2;
        for (let i = 0; i < orbitCount; i++) {
            const maxDistance = Math.min(this.width, this.height) / 2 - 75;
            const offset = 100;
            let orbitRadius = Math.random() * (maxDistance - offset) + offset;
            // Render a circle with radius equal to orbitRadius
            this.generateOrbitStations(orbitRadius);
        }
    }

    generateOrbitStations(radius) {
        let stationCount = Math.random() * 4 + 2;
        let stationIndex = 0;
        let tries = 0;
        while (stationIndex < stationCount) {
            if (tries > 10) {
                stationIndex++;
            }
            const angle = Math.random() * 2 * Math.PI;

            const jitter = Math.random() * 25 - 50;

            const x = (radius + jitter) * Math.cos(angle);
            const y = (radius + jitter) * Math.sin(angle);
            const pos = new Vector2(x, y);

            const minDistance = 20;
            // Check if the stations is far enough from other stations
            let isFarEnough = true;
            for (let i = 0; i < this.stations.length; i++) {
                const delta = this.stations[i].pos.sub(pos);
                const distance = delta.magnitude();
                if (distance < minDistance) {
                    isFarEnough = false;
                    tries++;
                    break;
                }
            }

            if (!isFarEnough) {
                continue;
            }

            const station = new SpaceStation(pos);
            this.stations.push(station);

            stationIndex++;
        }
    }

    tick() {
        for (let i = 0; i < this.stations.length; i++) {
            this.stations[i].tick();
        }
    }
}