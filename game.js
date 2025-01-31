const game = {
    screen: {
        offset: {
            x: 0,
            y: 0
        },
    },
    player: {
        inventory: {
            items: []
        },
        credits: 0,
        location: {
            x: 0,
            y: 0
        },
        destination: null,
        ship: {
            name: 'Starship',
            maxFuel: 100,
            maxCargo: 100,
            fuel: 100,
            consumption: 1,
            speed: 5,
        }
    }
}
const stations = [];
function drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

const canvas = document.getElementById('screen');

// Required for the canvas to fill the entire screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let WORLD_WIDTH = canvas.width;
let WORLD_HEIGHT = canvas.height;

// WORLD_WIDTH = gameElement.clientWidth;
// WORLD_HEIGHT = gameElement.clientHeight + 75;

const itemsTypes = {
    ore: {
        id: 1,
        name: 'Ore',
        description: 'A raw material used in manufacturing',
        value: 10
    },
    fuel: {
        id: 2,
        name: 'Fuel',
        description: 'A substance used to power engines',
        value: 20
    },
    food: {
        id: 3,
        name: 'Food',
        description: 'A consumable item for crew members',
        value: 5
    }
};

const ctx = canvas.getContext('2d');

function generateStations() {
    let orbitCount = Math.random() * 4 + 2;
    for (let i = 0; i < orbitCount; i++) {
        const maxDistance = WORLD_WIDTH / 2 - 75;
        const offset = 100;
        let orbitRadius = Math.random() * (maxDistance - offset) + offset;
        // Render a circle with radius equal to orbitRadius
        generateOrbitStations(orbitRadius);
    }
}

function generateOrbitStations(radius) {
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

        const minDistance = 20;
        // Check if the stations is far enough from other stations
        let isFarEnough = true;
        for (let i = 0; i < stations.length; i++) {
            const dx = stations[i].x - x;
            const dy = stations[i].y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                isFarEnough = false;
                tries++;
                break;
            }
        }

        if (!isFarEnough) {
            continue;
        }

        const station = createStation(x, y, generateSpaceStationName(), 5, 'white');
        const initialInventoryItems = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < initialInventoryItems; i++) {

            let itemCount = Math.floor(Math.random() * 10) + 1;
            let itemTypesCount = Object.keys(itemsTypes).length;
            let itemId = Math.floor(Math.random() * itemTypesCount) + 1;
            station.inventory.add(itemId, itemCount);
        }

        stations.push(station);

        stationIndex++;
    }
}

function createStation(x, y, name, size, color) {
    return {
        x,
        y,
        name,
        size,
        color,
        processed: false,
        inventory: {
            items: [],
            add(itemId, quantity) {
                const existingItem = this.items.find(item => item.id === itemId);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    this.items.push({
                        id: itemId,
                        quantity
                    });
                }
            },
            remove(itemId, quantity) {
                const existingItem = this.items.find(item => item.id === itemId);
                if (existingItem) {
                    existingItem.quantity -= quantity;
                    if (existingItem.quantity <= 0) {
                        this.items = this.items.filter(item => item.id !== itemId);
                    }
                }
            },
        },
    };
}

function renderStation(station) {
    const sx = game.screen.offset.x + station.x;
    const sy = game.screen.offset.y + station.y;
    if (station.hovered) {
        drawCircle(ctx, sx, sy, station.size + 3, 'red');
    }

    if (station.selected) {
        drawCircle(ctx, sx, sy, station.size + 3, 'blue');
    }
    drawCircle(ctx, sx, sy, station.size, station.color);
}

function generateSpaceStationName() {
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

function renderStations() {
    connectStations(ctx, stations);

    for (let i = 0; i < stations.length; i++) {
        renderStation(stations[i]);
    }

    revertProcessingMark(stations);
}

function render() {
    ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    renderStations();
    renderPlayer(game.player);
    renderUI();

    requestAnimationFrame(render);
}

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

        const dx = station.x - otherStation.x;
        const dy = station.y - otherStation.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestStation = otherStation;
        }
    }

    return nearestStation;
}

function drawLine(ctx, from, to, color) {
    ctx.beginPath();
    ctx.moveTo(game.screen.offset.x + from.x, game.screen.offset.y + from.y);
    ctx.lineWidth = 2;
    ctx.lineTo(game.screen.offset.x + to.x, game.screen.offset.y + to.y);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function connectStations(ctx, stations) {
    let currentStation = stations[0];
    currentStation.processed = true;
    let nextStation = findNearestStation(currentStation, stations);
    while (nextStation) {
        drawLine(ctx, currentStation, nextStation, 'orange');
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
            console.log('dragging');
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

    for (let i = 0; i < stations.length; i++) {
        stations[i].hovered = false;
    }

    const x = event.clientX;
    const y = event.clientY;
    const rect = canvas.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

    for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        const dx = mouseX - station.x - game.screen.offset.x;
        const dy = mouseY - station.y - game.screen.offset.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < station.size) {
            station.hovered = true;
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
    
    for (let i = 0; i < stations.length; i++) {
        stations[i].selected = false;
    }

    const x = event.clientX;
    const y = event.clientY;
    const rect = canvas.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

    for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        const dx = mouseX - station.x - game.screen.offset.x;
        const dy = mouseY - station.y - game.screen.offset.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < station.size) {
            station.selected = true;
            break;
        }
    }
});

// When a station is double clicked, set it as the player's destination
document.getElementById('screen').addEventListener('dblclick', function (event) {
    const x = event.clientX;
    const y = event.clientY;
    const rect = canvas.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

    for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        const dx = mouseX - station.x - game.screen.offset.x;
        const dy = mouseY - station.y - game.screen.offset.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < station.size) {
            game.player.destination = station;
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

function renderPlayer(player) {
    if (player.destination) {
        drawLine(ctx, player.location, player.destination, 'green');
    }

    drawCircle(ctx,
        game.screen.offset.x + player.location.x,
        game.screen.offset.y + player.location.y, 4, 'red');
}

function renderUI() {
    let selectedStation = null;
    for (let i = 0; i < stations.length; i++) {
        if (stations[i].selected) {
            selectedStation = stations[i];
            break;
        }
    }

    if (selectedStation) {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText(selectedStation.name, 10, 30);

        ctx.font = '16px Arial';
        ctx.fillText(`X: ${selectedStation.x.toFixed(2)}, Y: ${selectedStation.y.toFixed(2)}`, 10, 60);

        ctx.fillText('Inventory:', 10, 90);
        for (let i = 0; i < selectedStation.inventory.items.length; i++) {
            const item = selectedStation.inventory.items[i];

            const itemType = Object.values(itemsTypes).find(type => type.id === item.id);
            ctx.fillText(`${itemType.name}: ${item.quantity}`, 20, 120 + i * 30);

            // Buy button
            ctx.fillStyle = 'green';
            ctx.fillRect(200, 110 + i * 30, 50, 20);
            ctx.fillStyle = 'white';
            ctx.fillText('Buy', 205, 125 + i * 30);

            // Sell button
            ctx.fillStyle = 'red';
            ctx.fillRect(260, 110 + i * 30, 50, 20);
            ctx.fillStyle = 'white';
            ctx.fillText('Sell', 265, 125 + i * 30);
        }
    }

    const offsetY = WORLD_HEIGHT - 100;
    //Fill with white, 50% alpha
    ctx.fillStyle = 'rgba(64, 64, 64, 0.8)';
    ctx.fillRect(0, offsetY, WORLD_WIDTH, 100);

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Credits: ${game.player.credits}`, 10, offsetY + 30);
    ctx.fillText(`Fuel:`, 10, offsetY + 45);
    renderProgressBar(ctx, 50, offsetY + 35, 200, 10, game.player.ship.maxFuel, game.player.ship.fuel);
    ctx.fillText(`Destination: ${game.player.destination ? game.player.destination.name : 'None'}`, 10, offsetY + 60);

}

function renderProgressBar(ctx, x, y, width, height, maxValue, value) {
    const prevFillStyle = ctx.fillStyle;
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, width, height);

    const percentage = value / maxValue;
    const barWidth = width * percentage;

    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, barWidth, height);

    ctx.fillStyle = prevFillStyle;
}

game.screen.offset.x = WORLD_WIDTH / 2;
game.screen.offset.y = WORLD_HEIGHT / 2;

function tick(game) {
    if (game.player.destination) {
        // Check player fuel
        if (game.player.ship.fuel <= 0) {
            game.player.destination = null;
            return;
        }

        const dx = game.player.destination.x - game.player.location.x;
        const dy = game.player.destination.y - game.player.location.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 5) {
            // Snap to the station
            game.player.location.x = game.player.destination.x;
            game.player.location.y = game.player.destination.y;

            game.player.destination = null;
        } else {
            const angle = Math.atan2(dy, dx);
            game.player.location.x += Math.cos(angle) * game.player.ship.speed;
            game.player.location.y += Math.sin(angle) * game.player.ship.speed;

            game.player.ship.fuel -= game.player.ship.consumption;
        }
    }
}

generateStations();

render();


setInterval(() => {
    tick(game);
}, 1000 / 60);