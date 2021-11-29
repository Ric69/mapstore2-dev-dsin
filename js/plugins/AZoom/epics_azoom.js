import * as Rx from 'rxjs';
// import toBbox from 'turf-bbox';
// import pointOnSurface from '@turf/point-on-surface';
import assign from 'object-assign';
// import { sortBy, isNil } from 'lodash';

// import { queryableLayersSelector, getLayerFromName } from '@mapstore/selectors/layers';

import { updateAdditionalLayer } from '@mapstore/actions/additionallayers';
// import { showMapinfoMarker, featureInfoClick } from '@mapstore/actions/mapInfo';
import { zoomToExtent, zoomToPoint } from '@mapstore/actions/map';
// import { changeLayerProperties } from '@mapstore/actions/layers';

import { ZOOM_ADD_POINT } from './actions_azoom';

// import CoordinatesUtils from '@mapstore/utils/CoordinatesUtils';
import {mydefaultIconStyle} from './defaultIconZoom';

// import {generateTemplateString} from '@mapstore/utils/TemplateUtils';

import { identifyOptionsSelector } from '@mapstore/selectors/mapInfo';

const getInfoFormat = (layerObj, state) => getDefaultInfoFormatValueFromLayer(layerObj, {...identifyOptionsSelector(state)});

export const zoomAndAddPointEpic = (action$, store) =>
    action$.ofType(ZOOM_ADD_POINT)
        .switchMap(action => {
            const feature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [action.pos.x, action.pos.y]
                }
            };

            const state = store.getState();
            return Rx.Observable.from([
                updateAdditionalLayer("azoom", "azoom", 'overlay', {
                    features: [feature],
                    type: "vector",
                    name: "azoomoints",
                    id: "azoomPoints",
                    visibility: true,
                    style: defaultIconStyle
                }),
                zoomToPoint(action.pos, action.zoom, action.crs)
            ]);
        });