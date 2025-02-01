
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

        const distance = station.pos.sub(otherStation.pos).magnitude();
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestStation = otherStation;
        }
    }

    return nearestStation;
}

function connectStations(ctx, stations) {
    let currentStation = stations[0];
    currentStation.processed = true;
    let nextStation = findNearestStation(currentStation, stations);
    while (nextStation) {
        const from = currentStation.pos.scale(game.screen.scale);
        const to = nextStation.pos.scale(game.screen.scale);
        drawLine(ctx, from, to, 'orange');
        currentStation = nextStation;
        currentStation.processed = true;
        nextStation = findNearestStation(currentStation, stations);
    }
}