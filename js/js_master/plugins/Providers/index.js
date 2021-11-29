const Rx = require('rxjs');

const { ADD_WFS, updateNode } = require('@mapstore/actions/layers');
const { info, error, success } = require('@mapstore/actions/notifications');

// const ProviderUtils = require('@js/utils/ProviderUtils');
const ConfigUtils = require('@mapstore/utils/ConfigUtils');

/**
 * Désactivé car le SLDReader n'est pas à jour
 */
// const LoadDefaultStyle = (action$, store) =>
//     action$
//         .ofType(ADD_WFS)
//         .filter((action) => !['profile'].includes(action.id))
//         .filter((action) => action.url && action.url.includes(ConfigUtils.getConfigProp('mainNdd')))
//         .switchMap((action) => {
//             ProviderUtils.getStyle({
//                 name: action.layer.name,
//                 geometry: action.layer.geoJson.features[0].geometry.type,
//             })
//                 .then((response) => {
//                     store.dispatch(
//                         updateNode(action.id, 'layers', {
//                             style: response,
//                         })
//                     );
//                 })
//                 .catch(() => {});
//
//             return Rx.Observable.empty();
//         });

/**
 * @author CapGemini
 *
 * Liste des Providers pour certaines couches CNR
 */
module.exports = {
    Arcgis: require('@js/plugins/Providers/Layers/Arcgis'),
    WFSLayer: require('./Layers/WFS'),
    // epics: {
    //     LoadDefaultStyle,
    // },
};
