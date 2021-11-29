/**
 * @author CapGemini
 * Utilities for strings
 */

const _secretKey = 'capgemini';
const Cryptr = require('cryptr');
const cryptObj = new Cryptr(_secretKey);

const StringUtils = {
    /**
     * Méthode permettant de convertir une URL en base64
     * @param {String} url L'url de l'image
     * @param {Function} callback La fonction de retour
     * @param {String} [outputFormat = image/png] Le format de retour
     * @param errorCallback
     */
    convertImgToBase64URL(url, callback, outputFormat = 'image/png', errorCallback) {
        let img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onerror = errorCallback;
        img.src = url;
        img.onload = () => {
            let canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'),
                dataURL;
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
            canvas = null;
        };
    },

    /**
     * Retourne un ordre alphabétique. Comme les colonnes sur Excel (A, B, C, ... AA, AB, AC, ...)
     * @param n
     * @returns {string}
     */
    alphabetKey: (n) => {
        const ordA = 'a'.charCodeAt(0);
        const ordZ = 'z'.charCodeAt(0);
        const length = ordZ - ordA + 1;

        let s = '';
        while (n >= 0) {
            s = String.fromCharCode((n % length) + ordA) + s;
            n = Math.floor(n / length) - 1;
        }

        return s.toUpperCase();
    },

    /**
     * @private
     * @param  {string} hex   eg #AA00FF
     * @param  {Number} alpha eg 0.5
     * @return {string}       rgba(0,0,0,0)
     */
    hexToRGB: (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        if (alpha) {
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
        }

        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    },

    /**
     * RANDOM STRING GENERATOR
     *
     * Info:      http://stackoverflow.com/a/27872144/383904
     * Use:       randomString(length [,"A"] [,"N"] );
     * Default:   return a random alpha-numeric string
     * Arguments: If you use the optional "A", "N" flags:
     *            "A" (Alpha flag)   return random a-Z string
     *            "N" (Numeric flag) return random 0-9 string
     */
    randomString: (len, an) => {
        an = an && an.toLowerCase();
        let str = '',
            i = 0,
            min = an === 'a' ? 10 : 0,
            max = an === 'n' ? 10 : 62;
        for (; i++ < len; ) {
            let r = (Math.random() * (max - min) + min) << 0;
            str += String.fromCharCode((r += r > 9 ? (r < 36 ? 55 : 61) : 48));
        }

        return str;
    },
    /**
     * Obtenir un identifiant unique
     * @returns {string}
     */
    uniqid: () => {
        return (new Date().getTime() + Math.floor(Math.random() * 10000 + 1)).toString(16);
    },

    /**
     * Récupération de l'url en supprimant la fin de l'url {z}/{y}/{x}.png
     * @param {string} url
     * @param pattern
     */
    baseUrlArcGIS: (url, pattern = /{z}\/{y}\/{x}\.png/) => {
        return url.replace(pattern, '');
    },

    /**
     * Suppression de caractère invalide
     * @param string
     * @returns {string}
     */
    cleanString: (string) => {
        let output = '';

        for (let i = 0; i < string.length; i++) {
            if (string.charCodeAt(i) <= 127) {
                output += string.charAt(i);
            }
        }

        return output;
    },

    encode: (tag) => {
        return cryptObj.encrypt(tag);
    },

    decode: (string) => {
        return cryptObj.decrypt(string);
    },

    dividerCharacter: () => {
        return '[----divide-content----]';
    },

    /**
     *
     * @param string
     * @returns {*}
     */
    sanitizeContentWindow: (string) => {
        if (!string) {
            return string;
        }
        let sanitize = string;
        sanitize = sanitize.replace('<![CDATA[', '');
        sanitize = sanitize.replace(']]>', '');

        return sanitize;
    },

    isEmptyContent: (content) => {
        return (
            content === undefined ||
            content === '' ||
            content === '<![CDATA[]]>' ||
            content === '<p><br></p>' ||
            content === '<![CDATA[<p><br></p>]]>'
        );
    },
};

module.exports = StringUtils;
