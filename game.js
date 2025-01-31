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
        fuel: 100,
        location: {
            x: 0,
            y: 0
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

const gameElement = document.getElementById('game');
gameElement.clientHeight = window.innerHeight;
const canvas = document.getElementById('screen');
canvas.width = gameElement.clientWidth;
canvas.height = gameElement.clientHeight;

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
        const maxDistance = canvas.width / 2 - 75;
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderStations();
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

function drawLine(ctx, from, to) {
    ctx.beginPath();
    ctx.moveTo(game.screen.offset.x + from.x, game.screen.offset.y + from.y);
    ctx.lineWidth = 4;
    ctx.lineTo(game.screen.offset.x + to.x, game.screen.offset.y + to.y);
    ctx.strokeStyle = 'green';
    ctx.stroke();
}

function connectStations(ctx, stations) {
    let currentStation = stations[0];
    currentStation.processed = true;
    let nextStation = findNearestStation(currentStation, stations);
    while (nextStation) {
        drawLine(ctx, currentStation, nextStation);
        currentStation = nextStation;
        currentStation.processed = true;
        nextStation = findNearestStation(currentStation, stations);
    }
}

// When mouse moves over a station, highlight it and show its name
// When mouse moves out of a station, remove the highlight and hide the name
// end
document.getElementById('screen').addEventListener('mousemove', function (event) {
    if (isDragging) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;

        game.screen.offset.x += dx;
        game.screen.offset.y += dy;
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

// When dragging the mouse, alter game screen offset
let isDragging = false;
let lastX = 0;
let lastY = 0;
document.getElementById('screen').addEventListener('mousedown', function (event) {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
});

document.getElementById('screen').addEventListener('mouseup', function (event) {
    isDragging = false;
});

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
        }
    }
}

game.screen.offset.x = ctx.canvas.width / 2;
game.screen.offset.y = ctx.canvas.height / 2;

generateStations();

render();
