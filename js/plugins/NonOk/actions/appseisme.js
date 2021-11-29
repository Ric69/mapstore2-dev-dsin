export const ZOOM_TO_POINT = 'APPSEISME:ZOOM_TO_POINT';

/**
 * zoom to a specific point
 * @memberof actions.map
 * @param {object} pos as array [x, y] or object {x: ..., y:...}
 * @param {number} zoom level to zoom to
 * @param {string} crs of the point
*/
export function zoomToPoint(pos, zoom, crs) {
    return {
        type: ZOOM_TO_POINT,
        pos,
        zoom,
        crs
    };
}