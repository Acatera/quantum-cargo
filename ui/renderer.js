import { Vector2 } from "../vector2.js";
import { itemsTypes } from "../item-types.js";

export class Renderer {
    constructor(screen, game) {
        this.screen = screen;
        this.game = game;
        this.context = screen.context;
        this.testRender = false;
    }

    _renderDiagonalLine() {
        // Draw a line from top-left to bottom-right
        this.context.strokeStyle = "red";
        this.context.lineWidth = 2;
        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(this.screen.width, this.screen.height);
        this.context.stroke();

    }

    render() {
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.screen.width, this.screen.height);

        if (this.testRender) {
            this._renderDiagonalLine();
            return;
        }

        this.renderStations(this.game.world.stations);
        this.renderPlayer(this.game.player);
        this.renderUI();
    }

    renderStations(stations) {
        // connectStations(this.context, stations);

        for (let i = 0; i < stations.length; i++) {
            this.renderStation(stations[i]);
        }

        // revertProcessingMark(stations);
    }

    renderStation(station) {
        const screenPos = this.screen.transformToScreenPos(station.pos);
        if (station.hovered) {
            this._drawCircle(this.context, screenPos, (station.size + 3) * this.screen.zoom, 'red');
        }

        if (station.id === this.game.selectedStation?.id) {
            this._drawCircle(this.context, screenPos, (station.size + 3) * this.screen.zoom, 'blue');
        }

        this._drawCircle(this.context, screenPos, station.size * this.screen.zoom, station.color);
    }

    renderPlayer(player) {
        const screenPos = this.screen.transformToScreenPos(player.location);
        if (player.destination) {
            const destination = this.screen.transformToScreenPos(player.destination.pos);
            this._drawLine(this.context, screenPos, destination, 'green');
        }

        const playerPos = this.screen.transformToScreenPos(player.location);
        this._drawCircle(this.context, playerPos, 4 * this.screen.zoom, 'red');
    }

    _drawCircle(ctx, pos, radius, color) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }

    _drawLine(ctx, from, to, color) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineWidth = 2 * this.screen.zoom;
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    renderUI() {
        if (this.game.player.ship.fuel <= 0) {

            this.renderEndGameScreen();
            return;
        }

        if (this.screen.active) {
            this.screen.active.render(this.context);
            return;
        }

        if (this.game.selectedStation) {
            this.renderStationUI(this.game.selectedStation);
        }

        this.renderPlayerUI(this.game.player);
    }

    renderStationUI(station) {
        this.context.fillStyle = 'white';
        this.context.font = '24px Arial';
        this.context.fillText(this.game.selectedStation.name, 10, 30);

        this.context.font = '16px Arial';
        this.context.fillText(`X: ${this.game.selectedStation.pos.x.toFixed(2)}, Y: ${this.game.selectedStation.pos.y.toFixed(2)}`, 10, 60);

        this.context.fillText('Inventory:', 10, 90);
        for (let i = 0; i < this.game.selectedStation.inventory.items.length; i++) {
            const item = this.game.selectedStation.inventory.items[i];

            const itemType = Object.values(itemsTypes).find(type => type.id === item.id);
            if (this.game.selectedItemIndex === i) {
                this.context.fillStyle = 'orange';
                // Unicode dot
                this.context.fillText('\u2022', 10, 120 + i * 30);
            } else {
                this.context.fillStyle = 'white';
            }

            this.context.fillText(`${itemType.name}: ${item.quantity}`, 20, 120 + i * 30);
        }
    }

    renderPlayerUI(player) {
        const offsetY = this.screen.height - 100;
        //Fill with white, 50% alpha
        this.context.fillStyle = 'rgba(64, 64, 64, 0.8)';
        this.context.fillRect(0, offsetY, this.screen.width, 100);

        this.context.fillStyle = 'white';
        this.context.font = '16px Arial';
        // Format credits with thousand separator
        this.context.fillText(`Credits: ${this.game.player.credits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, 10, offsetY + 30);
        this.context.fillText(`Fuel:`, 10, offsetY + 45);
        this.renderProgressBar(new Vector2(50, offsetY + 35), new Vector2(200, 10), this.game.player.ship.maxFuel, this.game.player.ship.fuel);
        this.context.fillText(`Destination: ${this.game.player.destination ? this.game.player.destination.name : 'None'}`, 10, offsetY + 60);
        this.context.fillText(`Station: ${this.game.player.station ? this.game.player.station.name : 'None'}`, 10, offsetY + 75);
    }

    renderEndGameScreen() {
        // Clear screen
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = 'red';
        this.context.font = '24px Arial';
        this.context.textAlign = 'center';
        this.context.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);

        this.context.fillStyle = 'white';
        this.context.font = '16px Arial';
        this.context.fillText('Out of fuel', this.canvas.width / 2, this.canvas.height / 2 + 30);

        this.context.fillStyle = 'white';
        this.context.font = '16px Arial';
        this.context.fillText('Press F5 to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }


    renderProgressBar(pos, size, maxValue, value) {
        const prevFillStyle = this.context.fillStyle;
        this.context.fillStyle = 'white';
        this.context.fillRect(pos.x, pos.y, size.x, size.y);

        const percentage = value / maxValue;
        const barWidth = size.x * percentage;

        this.context.fillStyle = 'green';
        this.context.fillRect(pos.x, pos.y, barWidth, size.y);

        this.context.fillStyle = prevFillStyle;
    }
}