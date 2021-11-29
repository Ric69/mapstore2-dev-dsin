const moment = require('moment');
const { isString } = require('lodash');

/**
 * Permet de savoir si c'est une date et de transformer l'élément si besoin
 * @param {String} element L'élément à vérifier
 * @param {String} formatSource Le format de date source
 * @param {String} formatCible Le format de date cible
 * @returns {String} Si la date doit être transformée, elle est renvoyée transformée.
 * Si l'élément n'est pas une date, il est renvoyé comme il est arrivé.
 */
const transformIfIsDate = (element, formatSource = 'YYYY-MM-DD', formatCible = 'DD/MM/YYYY') => {
    if (!isString(element)) {
        return element;
    }

    if (element === null || element === undefined) {
        return element;
    }

    if ((element || '').split('-').length === 3) {
        if (moment(element, formatSource).isValid()) {
            return moment(element)
                .format(formatCible)
                .toString();
        }
    }

    return element;
};

export { transformIfIsDate };
