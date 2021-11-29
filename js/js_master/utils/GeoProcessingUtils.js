/**
 * @author CapGemini
 * Utilities pour Géo Traitement
 */
const GeoProcessingUtils = {
    /**
     * Process XML pour l'outil gs:CollectGeometries
     * @param layerName
     * @returns {string}
     */
    collectGeometries: (layerName) => {
        return (
            GeoProcessingUtils.getIdentifier('gs:CollectGeometries') +
            '<wps:DataInputs>\n' +
            GeoProcessingUtils.getInput({ typeName: layerName, identifier: 'features' }) +
            '</wps:DataInputs>\n' +
            GeoProcessingUtils.getResponseForm()
        );
    },

    /**
     * Process XML pour l'affichage de données JSON
     * @param identifier string Nom de l'identifier
     * @param data object Données Json
     * @param traverse boolean Vérifier si le polygon est bien fermé
     * @returns {string}
     */
    getComplexData: ({ identifier, data }) => {
        return (
            '<wps:Input>\n' +
            GeoProcessingUtils.getIdentifier(identifier) +
            '<wps:Data>\n' +
            '<wps:ComplexData mimeType="application/json">\n' +
            '<![CDATA[' +
            JSON.stringify(data) +
            ']]>\n' +
            '</wps:ComplexData>\n' +
            '</wps:Data>\n' +
            '</wps:Input>'
        );
    },

    /**
     * Process XML pour la partie Execute (Exécution d'un sous process)
     * En général, fonctionne avec collectGeometries
     * @param xml
     * @param identifier
     * @returns {string}
     */
    getExecute: ({ xml, identifier }) => {
        return (
            '<wps:Input>\n' +
            GeoProcessingUtils.getIdentifier(identifier) +
            '<wps:Reference mimeType="application/json" xlink:href="http://geoserver/wps" method="POST">\n' +
            '<wps:Body>\n' +
            '<wps:Execute version="1.0.0" service="WPS">\n' +
            xml +
            '</wps:Execute>\n' +
            '</wps:Body>\n' +
            '</wps:Reference>\n' +
            '</wps:Input>\n'
        );
    },

    /**
     * Partie XML pour l'Identifier
     * @param name
     * @returns {string}
     */
    getIdentifier: (name) => {
        return '<ows:Identifier>' + name + '</ows:Identifier>\n';
    },

    /**
     * Partie XML pour définir la query d'une coude
     * @param typeName string Nom de la couche
     * @param identifier
     * @returns {string}
     */
    getInput: ({ typeName, identifier }) => {
        return (
            '<wps:Input>\n' +
            GeoProcessingUtils.getIdentifier(identifier) +
            '<wps:Reference mimeType="text/xml" xlink:href="http://geoserver/wfs" method="POST">\n' +
            '<wps:Body>\n' +
            '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2">\n' +
            '<wfs:Query typeName="' +
            typeName +
            '"/>\n' +
            '</wfs:GetFeature>\n' +
            '</wps:Body>\n' +
            '</wps:Reference>\n' +
            '</wps:Input>\n'
        );
    },

    /**
     * Partie XML pour LiteralData
     * @param identifier
     * @param data
     * @returns {string}
     */
    getLiteralData: ({ identifier, data }) => {
        return (
            '<wps:Input>\n' +
            GeoProcessingUtils.getIdentifier(identifier) +
            '<wps:Data>\n' +
            '<wps:LiteralData>' +
            data +
            '</wps:LiteralData>\n' +
            '</wps:Data>\n' +
            '</wps:Input>'
        );
    },

    /**
     * Retourne la partie XML par rapport au format de réponse souhaité
     * @param mimeType Default application/json
     * - text/xml; subtype=gml/3.1.1
     * - text/xml; subtype=gml/2.1.2
     * - application/wkt
     * - application/json
     * - application/gml-3.1.1
     * - application/gml-2.1.2
     * @returns {string}
     */
    getResponseForm: (mimeType = 'application/json') => {
        return (
            '<wps:ResponseForm>\n' +
            '<wps:RawDataOutput mimeType="' +
            mimeType +
            '">\n' +
            '<ows:Identifier>result</ows:Identifier>\n' +
            '</wps:RawDataOutput>\n' +
            '</wps:ResponseForm>\n'
        );
    },

    /**
     * Obtenir la donnée en XML compléte qui servira pour l'appel WPS
     * @return {string} XML
     */
    getXML: ({ identifier, source, dest, adds = '' }) => {
        let xml =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">\n' +
            GeoProcessingUtils.getIdentifier(identifier) +
            '<wps:DataInputs>\n';
        xml += source;
        if (dest) {
            xml += dest;
        }
        if (adds !== '') {
            xml += adds;
        }
        xml += '</wps:DataInputs>\n' + GeoProcessingUtils.getResponseForm() + '</wps:Execute>';

        return xml;
    },
};

module.exports = GeoProcessingUtils;
