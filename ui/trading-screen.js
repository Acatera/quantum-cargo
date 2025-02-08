import { itemsTypes } from '../item-types.js';

export class TradingScreen {
    constructor(screen, player, station) {
        this.screen = screen;
        this.player = player;
        this.station = station;
        this.selectedLeftItemIndex = 0;
        this.selectedRightItemIndex = 0;
        this.selectedPanel = 'left';
        this.itemsSold = [];
        this.itemsBought = [];
    }

    drawNeonRect(ctx, x, y, w, h) {
        ctx.shadowColor = "cyan"; // Neon cyan
        ctx.shadowBlur = 10;       // Glow intensity
        ctx.shadowOffsetX = 10;    // Offset from element

        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h); // Glowing rectangular outline
    }

    drawGlitchRect(ctx, x, y, w, h) {
        ctx.fillStyle = "rgba(0, 255, 255, 0.8)"; // Neon cyan with transparency

        for (let i = 0; i < 6; i++) {
            let glitchX = x + Math.random() * w;
            let glitchW = 10 + Math.random() * (w / 4);
            ctx.fillRect(glitchX, y, glitchW, 10);
            ctx.fillRect(glitchX, y + h - 10, glitchW, 10);
        }
    }

    drawGradientRect(ctx, x, y, w, h) {
        const gradient = ctx.createLinearGradient(x, y, x + w, y);
        gradient.addColorStop(0, "magenta");
        gradient.addColorStop(0.5, "cyan");
        gradient.addColorStop(1, "blue");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);
    }

    drawGridOverlay(ctx, x, y, w, h) {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.2)"; // Faint grid color
        ctx.lineWidth = 1;

        for (let i = x; i < x + w; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, y);
            ctx.lineTo(i, y + h);
            ctx.stroke();
        }

        for (let j = y; j < y + h; j += 10) {
            ctx.beginPath();
            ctx.moveTo(x, j);
            ctx.lineTo(x + w, j);
            ctx.stroke();
        }
    }

    drawAnimatedGlitchRect(ctx, x, y, w, h) {
        function glitch() {
            ctx.clearRect(x, y, w, h);

            ctx.strokeStyle = "cyan";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);

            ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
            for (let i = 0; i < 5; i++) {
                let glitchX = x + Math.random() * w;
                let glitchW = 10 + Math.random() * (w / 4);
                ctx.fillRect(glitchX, y, glitchW, 5);
                ctx.fillRect(glitchX, y + h - 5, glitchW, 5);
            }

            setTimeout(glitch, 200); // Redraw every 200ms
        }
        glitch();
    }

    drawRect(ctx, x, y, w, h, c, lw) {
        ctx.strokeStyle = c;
        ctx.lineWidth = lw;
        ctx.strokeRect(x, y, w, h);
    }

    render(ctx) {
        // cyber punk style
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.screen.width, this.screen.height);

        // Render header
        // this.drawNeonRect(ctx, 0, 0, this.screen.width, 50);
        // this.drawGlitchRect(ctx, 0, 0, this.screen.width, 50);
        // this.drawGradientRect(ctx, 0, 0, this.screen.width, 50);
        // this.drawAnimatedGlitchRect(ctx, 0, 0, this.screen.width, 50);
        // this.drawGridOverlay(ctx, 0, 0, this.screen.width, 50);


        ctx.fillStyle = 'white';
        let text = this.station.name;
        let metrics = ctx.measureText(text);
        ctx.font = '20px Arial';
        ctx.fillText(text, this.screen.width / 2 - metrics.width / 2, 30);

        const gap = 20;
        const colWidth = (this.screen.width - gap) / 2
        // Two columns: player inventory and station inventory
        const panelBackground = 'rgba(0, 120, 100, 1)';
        const fontColor = 'white';

        const bottomPadding = 150;

        // Draw left panel
        ctx.fillStyle = panelBackground;
        ctx.fillRect(0, 75, colWidth, this.screen.height - bottomPadding);

        if (this.selectedPanel === 'left') {
            this.drawRect(ctx, 0, 75, colWidth, this.screen.height - bottomPadding, 'cyan', 2);
        }

        ctx.fillStyle = fontColor;
        ctx.font = '16px Arial';
        text = 'Player Inventory';
        metrics = ctx.measureText(text);
        ctx.fillText(text, (colWidth - metrics.width) / 2, 60);

        // Draw the player's inventory
        for (let i = 0; i < this.player.inventory.items.length; i++) {
            const item = this.player.inventory.items[i];
            const itemType = Object.values(itemsTypes).find(type => type.id === item.id);
            const itemSold = this.itemsSold.find(is => is.id === item.id);

            if (this.selectedLeftItemIndex === i) {
                ctx.fillStyle = 'orange';
                ctx.fillText('\u2022', 4, 100 + i * 30);
            } else {
                ctx.fillStyle = fontColor;
            }
            ctx.fillText(`${itemType.name}: ${item.quantity - (itemSold?.qty || 0)}`, 10, 100 + i * 30);

            if (itemSold) {
                ctx.fillText(`Selling - ${itemSold.qty}`, colWidth - 100, 100 + i * 30);
            }
        }

        // Draw right panel
        ctx.fillStyle = panelBackground;
        ctx.fillRect(colWidth + gap, 75, colWidth, this.screen.height - bottomPadding);

        if (this.selectedPanel === 'right') {
            this.drawRect(ctx, colWidth + gap, 75, colWidth, this.screen.height - bottomPadding, 'cyan', 2);
        }

        ctx.fillStyle = fontColor;
        ctx.font = '16px Arial';
        text = 'Station Inventory';
        metrics = ctx.measureText(text);
        ctx.fillText(text, colWidth + gap + (colWidth - metrics.width) / 2, 60);

        // Draw the station's inventory
        for (let i = 0; i < this.station.inventory.items.length; i++) {
            const item = this.station.inventory.items[i];
            const itemsBought = this.itemsBought.find(ib => ib.id === item.id);
            const itemType = Object.values(itemsTypes).find(type => type.id === item.id);

            if (this.selectedRightItemIndex === i) {
                ctx.fillStyle = 'orange';
                ctx.fillText('\u2022', colWidth + gap + 4, 100 + i * 30);
            } else {
                ctx.fillStyle = fontColor;
            }
            ctx.fillText(`${itemType.name}: ${item.quantity - (itemsBought?.qty || 0)}`, colWidth + gap + 10, 100 + i * 30);

            if (itemsBought) {
                ctx.fillText(`Buying - ${itemsBought.qty}`, colWidth + gap + colWidth - 100, 100 + i * 30);
            }
        }

        // Render footer
        ctx.fillStyle = 'white';
        text = 'Enter - complete transaction; +/- - adjust quantity; Arrow keys - navigate; Esc - close';
        metrics = ctx.measureText(text);
        ctx.fillText(text, this.screen.width / 2 - metrics.width / 2, this.screen.height - 50);
    }

    handleKeyDown(event) {
        if (event.key === 'Escape') {
            this.screen.active = null;
            event.preventDefault();
            return;
        }

        if (event.key === 'ArrowLeft') {
            this.selectedPanel = 'left';
            event.preventDefault();
            return;
        }

        if (event.key === 'ArrowRight') {
            this.selectedPanel = 'right';
            event.preventDefault();
            return;
        }

        if (event.key === 'ArrowUp') {
            if (this.selectedPanel === 'left') {
                this.selectedLeftItemIndex--;
                if (this.selectedLeftItemIndex < 0) {
                    this.selectedLeftItemIndex = 0;
                }
            } else {
                this.selectedRightItemIndex--;
                if (this.selectedRightItemIndex < 0) {
                    this.selectedRightItemIndex = 0;
                }
            }
            event.preventDefault();
            return;
        }

        if (event.key === 'ArrowDown') {
            if (this.selectedPanel === 'left') {
                this.selectedLeftItemIndex++;
                if (this.selectedLeftItemIndex >= this.player.inventory.items.length) {
                    this.selectedLeftItemIndex = this.player.inventory.items.length - 1;
                }
            } else {
                this.selectedRightItemIndex++;
                if (this.selectedRightItemIndex >= this.station.inventory.items.length) {
                    this.selectedRightItemIndex = this.station.inventory.items.length - 1;
                }
            }
            event.preventDefault();
            return;
        }

        // Minus key decrements the quantity of the selected item
        if (event.key === '-') {
            if (this.selectedPanel === 'left') {
                const selectedItem = this.player.inventory.items[this.selectedLeftItemIndex];
                const itemSold = this.itemsSold.find(item => item.id === selectedItem.id);
                if (itemSold) {
                    itemSold.qty--;
                    if (itemSold.qty <= 0) {
                        this.itemsSold = this.itemsSold.filter(item => item.id !== selectedItem.id);
                    }
                }
            }

            if (this.selectedPanel === 'right') {
                const selectedItem = this.station.inventory.items[this.selectedRightItemIndex];
                const itemBought = this.itemsBought.find(item => item.id === selectedItem.id);
                if (itemBought) {
                    itemBought.qty--;
                    if (itemBought.qty <= 0) {
                        this.itemsBought = this.itemsBought.filter(item => item.id !== selectedItem.id);
                    }
                }
            }
            event.preventDefault();
            return;
        }

        // Plus key increments the quantity of the selected item
        if (event.key === '=' || event.key === '+') {
            if (this.selectedPanel === 'left') {
                const selectedItem = this.player.inventory.items[this.selectedLeftItemIndex];
                const itemSold = this.itemsSold.find(item => item.id === selectedItem.id);
                if (itemSold) {
                    if (itemSold.qty < selectedItem.quantity) {
                        itemSold.qty++;
                    }
                } else {
                    this.itemsSold.push({ id: selectedItem.id, qty: 1 });
                }
            }

            if (this.selectedPanel === 'right') {
                const selectedItem = this.station.inventory.items[this.selectedRightItemIndex];
                const itemBought = this.itemsBought.find(item => item.id === selectedItem.id);
                if (itemBought) {
                    if (itemBought.qty < selectedItem.quantity) {
                        itemBought.qty++;
                    }
                } else {
                    this.itemsBought.push({ id: selectedItem.id, qty: 1 });
                }
            }
            event.preventDefault();
            return;
        }


        // Enter key completes the transaction
        if (event.key === 'Enter') {
            this.itemsSold.forEach(item => {
                this.player.inventory.remove(item.id, item.qty);
                this.station.inventory.add(item.id, item.qty);
            });

            this.itemsBought.forEach(item => {
                this.player.inventory.add(item.id, item.qty);
                this.station.inventory.remove(item.id, item.qty);
            });

            this.itemsSold = [];
            this.itemsBought = [];
            event.preventDefault();
            return;
        }
    }
}