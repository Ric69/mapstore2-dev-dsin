/**
 * @author CapGemini
 * Utilities to generate an id for "Dessin, Forme et Requête Spatiale"
 */

import { GeoJSON } from 'ol/format';
import { Vector as VectorSource } from 'ol/source';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { groupsSelector } from '../../MapStore2/web/client/selectors/layers';
import { isArray } from 'lodash';

const groupDrawing = 'Dessins';
const groupMeasure = 'Mesures';
const groupReqSpat = 'Recherche FullText';
const groupGeoProcess = {
    intersect: 'intersect',
    cut: 'cut',
    union: 'union',
    diff: 'diff',
    group: 'group',
    buffer: 'buffer',
};

let counterDraw = 0;
let counterForme = 0;
let counterReqSpat = 0;
let counterGeoProcess = {
    intersect: 0,
    cut: 0,
    union: 0,
    diff: 0,
    group: 0,
    buffer: 0,
};
let init = false;

// Fonction qui permet d'initialiser le nombre de couche pour chaque groupe (Measure, Drawing, Requête Spatiale)
const initCounters = (state) => {
    // Récupération la liste des groupes
    const groups = groupsSelector(state);
    // Regex qui permet de récuperer l'id d'une couche
    const regex = /[^\s]* ([0-9]+)/i;
    let max = 0;
    groups.forEach((elt) => {
        // On ne fait pas le traitement s'il s'agit d'un autre groupe
        if ([groupDrawing, groupMeasure, groupReqSpat, groupGeoProcess].indexOf(elt.id) === -1)
            return;
        // Récupération la liste des couches d'un group donné
        let { nodes } = elt;
        max = 0;
        // Parcours la liste des couches
        nodes.forEach((noeud) => {
            // Recherche l'id maximum d'une couche
            let { title } = noeud;
            let result = regex.exec(title);
            if (isArray(result) && parseInt(result[1]) > max) max = parseInt(result[1]);
        });
        if (elt.id === groupDrawing) counterDraw = max;
        else if (elt.id === groupMeasure) counterForme = max;
        else if (elt.id === groupReqSpat) counterReqSpat = max;
        else if (elt.id === groupGeoProcess['intersect']) counterGeoProcess['intersect'] = max;
        else if (elt.id === groupGeoProcess['cut']) counterGeoProcess['cut'] = max;
        else if (elt.id === groupGeoProcess['union']) counterGeoProcess['union'] = max;
        else if (elt.id === groupGeoProcess['diff']) counterGeoProcess['diff'] = max;
        else if (elt.id === groupGeoProcess['group']) counterGeoProcess['group'] = max;
        else if (elt.id === groupGeoProcess['buffer']) counterGeoProcess['buffer'] = max;
    });
    // retourne true pour ne pas refaire le traitement à chaque fois
    return true;
};

const DrawUtils = {
    groupDrawing,
    groupMeasure,
    groupReqSpat,
    groupGeoProcess,

    /**
     * Obtenir l'extent par rapport à des features
     */
    getExtent: (geoJson) => {
        const geo = Array.isArray(geoJson)
            ? { type: 'FeatureCollection', features: geoJson }
            : geoJson;
        const format = new GeoJSON().readFeatures(geo);

        let vectorSource = new VectorSource({
            format: new GeoJSON(),
            strategy: bboxStrategy,
        });
        vectorSource.addFeatures(format);

        return vectorSource.getExtent();
    },

    generateId: (type, state) => {
        // si les compteurs ne sont pas intialisés, appel de la fonction initCounters()
        if (!init) init = initCounters(state);
        switch (type) {
            case groupDrawing:
                return ++counterDraw;
            case groupMeasure:
                return ++counterForme;
            case groupReqSpat:
                return ++counterReqSpat;
            case groupGeoProcess['intersect']:
                return ++counterGeoProcess['intersect'];
            case groupGeoProcess['cut']:
                return ++counterGeoProcess['cut'];
            case groupGeoProcess['union']:
                return ++counterGeoProcess['union'];
            case groupGeoProcess['diff']:
                return ++counterGeoProcess['diff'];
            case groupGeoProcess['group']:
                return ++counterGeoProcess['group'];
            case groupGeoProcess['buffer']:
                return ++counterGeoProcess['buffer'];
            default:
                break;
        }
    },
    // Fonction qui va être appeler quand on supprime une couche pour rappeler la fonction initCounters()
    resetInit: () => {
        init = false;
    },
};

export default DrawUtils;
