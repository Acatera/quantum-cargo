export class TradingScreen {
    constructor(game) {
        this.game = game;
    }

    render(ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Trading Screen', 10, 30);
    }

    handleKeyDown(event) {
        if (event.key === 'Escape') {
            this.game.screen.active = null;
            event.preventDefault();
        }
    }
}