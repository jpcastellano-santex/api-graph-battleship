const matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const shipStatus = {
    AFLOAT: 'Afloat',
    SUNKEN: 'Sunken',
};

const cellStatus = {
    HITTED: -2,
    MISS: -1,
    WATER: 0,
};

const ships = [
    { id: 1, size: 4, status: shipStatus.AFLOAT },
    { id: 2, size: 3, status: shipStatus.AFLOAT },
    { id: 3, size: 3, status: shipStatus.AFLOAT },
    { id: 4, size: 2, status: shipStatus.AFLOAT },
    { id: 5, size: 2, status: shipStatus.AFLOAT },
    { id: 6, size: 2, status: shipStatus.AFLOAT },
    { id: 7, size: 1, status: shipStatus.AFLOAT },
    { id: 8, size: 1, status: shipStatus.AFLOAT },
    { id: 9, size: 1, status: shipStatus.AFLOAT },
    { id: 10, size: 1, status: shipStatus.AFLOAT }
];

module.exports = {
    getRandomBoard: function () {
        const maxX = matrix.length - 1;
        const maxY = matrix[0].length - 1;
        const newMatrix = matrix.map(row => row.slice());
        ships.forEach((ship) => {
            const position = Math.floor(Math.random() * 2); // 0 -> horizontal. 1 -> vertical.
            let initialX = 0;
            let initialY = 0;
            let overlap = false;
            do {
                overlap = false;
                initialX = Math.floor(Math.random() * maxX);
                initialY = Math.floor(Math.random() * maxY);
                if (position) { // vertical check.
                    let i;
                    for (i = 0; i < ship.size; i += 1) {
                        if ((initialY + i > maxY) || (newMatrix[initialX][initialY + i] > cellStatus.WATER)) {
                            overlap = true;
                        }
                    }
                } else { // horizontal check.
                    let i;
                    for (i = 0; i < ship.size; i += 1) {
                        if ((initialX + i > maxX) || (newMatrix[initialX + i][initialY] > cellStatus.WATER)) {
                            overlap = true;
                        }
                    }
                }
            }
            while (overlap);
            if (position) { // vertical place.
                let i;
                for (i = 0; i < ship.size; i += 1) {
                    newMatrix[initialX][initialY + i] = ship.id;
                }
            } else { // horizontal place.
                let i;
                for (i = 0; i < ship.size; i += 1) {
                    newMatrix[initialX + i][initialY] = ship.id;
                }
            }
        });
        return newMatrix;
    }, cellStatus
}