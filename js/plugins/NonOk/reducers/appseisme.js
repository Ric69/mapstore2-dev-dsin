import { ZOOM_TO_POINT } from '@js/actions/appseisme';

import assign from 'object-assign';
import MapUtils from '.@mapstore/utils/MapUtils';
import CoordinatesUtils from '.@mapstore/utils/CoordinatesUtils';


function mapConfig(state = {eventListeners: {}}, action) {
    switch (action.type) {
        case ZOOM_TO_POINT: {
            return assign({}, state, {
                center: CoordinatesUtils.reproject(action.pos, 'EPSG:4326', 'EPSG:4326'),
                zoom: action.zoom,
                mapStateSource: null
            });
        }
        default:
            return state;
    }
}
export default mapConfig;
