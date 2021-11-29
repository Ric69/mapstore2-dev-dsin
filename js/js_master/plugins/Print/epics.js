const Rx = require('rxjs');
const {
    SET_PRINT_PARAMETER,
    setPrintParameter,
    changeDescriptionLength,
} = require('../../../MapStore2/web/client/actions/print');
const { TOGGLE_CONTROL } = require('@mapstore/actions/controls');
const { TOGGLE_LOADER } = require('@js/plugins/Atlas/actions');
const PrintUtils = require('../../../MapStore2/web/client/utils/PrintUtils');

/**
 * Liste des papiers + nombre max de caratères pour la description
 */
const papers = {
    A0: 740,
    A1: 500,
    A2: 380,
    A3: 260,
    A4: 160,
    A5: 116,
    atlas: 340,
};

const setMaxLength = ({ dispatch, paper }) => {
    setTimeout(() => {
        let element = document.getElementById('print-description');
        if (element === undefined || element === null) {
            element = document.getElementById('atlas-description');
        }
        if (element) {
            element.setAttribute('maxLength', papers[paper]);
            const charLeft = PrintUtils.changeDescriptionMaxLength(element);
            dispatch(changeDescriptionLength(charLeft));
        }

        /**
         * Modification du contenu de la description si trop long
         */
        if (element) {
            const maxLength = parseInt(element.getAttribute('maxLength') || 0);

            let value = element.value;
            if (element.value.length > maxLength) {
                value = value.substring(0, maxLength);
            }
            dispatch(setPrintParameter('description', value));
        }
    }, 750);
};

const SetMaxLengthForAtlas = (action$, store) =>
    action$.ofType(TOGGLE_LOADER).switchMap(() => {
        const state = store.getState();
        if (state.atlas.loader === true) {
            const dispatch = store.dispatch;
            setMaxLength({ dispatch, paper: 'atlas' });
        }
        return Rx.Observable.empty();
    });

const SetMaxLengthByPaper = (action$, store) =>
    action$
        .ofType(SET_PRINT_PARAMETER)
        .filter((action) => action.name === 'sheet')
        .switchMap((action) => {
            const dispatch = store.dispatch;
            setMaxLength({ dispatch, paper: action.value });
            return Rx.Observable.empty();
        });

const SetMaxLengthByControl = (action$, store) =>
    action$
        .ofType(TOGGLE_CONTROL)
        .filter((action) => action.control === 'print' || action.control === 'atlas')
        .switchMap(() => {
            const state = store.getState();
            const dispatch = store.dispatch;
            setMaxLength({ dispatch, paper: state.print.spec.sheet });
            return Rx.Observable.empty();
        });

module.exports = {
    SetMaxLengthByControl,
    SetMaxLengthByPaper,
    SetMaxLengthForAtlas,
};
