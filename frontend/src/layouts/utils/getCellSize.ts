
const zoomLevels = [4, 6, 7, 8, 10, 11, 12, 13, 14, 15];
const cellSizes = [0.5, 0.25, 0.125, 0.06, 0.03, 0.015, 0.008, 0.004, 0.002, 0.000015];

export const getCellSize = (zoom: number): number => {
    for (let i = 0; i < zoomLevels.length; i++) {
        if (zoom <= zoomLevels[i]) {
            return cellSizes[i];
        }
    }

    return 0.000015;
};