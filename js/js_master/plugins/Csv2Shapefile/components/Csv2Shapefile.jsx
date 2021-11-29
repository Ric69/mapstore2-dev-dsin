const React = require('react');
const { Glyphicon } = require('react-bootstrap');
const PropTypes = require('prop-types');
const Dialog = require('../../../../MapStore2/web/client/components/misc/Dialog');
const { Row, Col, Alert } = require('react-bootstrap');
const Dropzone = require('react-dropzone');
const prj = require('../../../utils/shp-write/src/prj');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const I18N = require('../../../../MapStore2/web/client/components/I18N/I18N');
const ExportUtils = require('../../../utils/ExportUtils');
const CoordinatesUtils = require('../../../../MapStore2/web/client/utils/CoordinatesUtils');
const StringUtils = require('../../../utils/StringUtils');
const { getName } = require('../../Projections/Utils/Projections');
const { GrDocumentCsv } = require('react-icons/gr');

require('./style.css');

class Csv2Shapefile extends React.Component {
    static propTypes = {
        /**
         * Variables
         */
        csv2Shapefile: PropTypes.object,
        /**
         * Function
         */
        onClose: PropTypes.func,
    };

    static defaultProps = {
        csv2Shapefile: {},
        onClose: () => {},
        separator: ';',
    };

    state = {
        /**
         * Le fichier csv choisi
         * @type {File}
         */
        file: undefined,
        /**
         * La projection des points du fichier CSV
         * @type {String}
         */
        projection: Object.keys(prj)[0],
    };

    /**
     * Gestion des variables de langues
     * @type {{messages: shim}}
     */
    static contextTypes = {
        messages: PropTypes.object,
    };

    /**
     * Méthode permettant de transformer des données au format CSV en un tableau
     * @param {String} data Le CSV
     * @return {Array} Le tableau de géometries
     */
    csvToArrayOfGeometries = (data) => {
        let features = [];
        let csvRows = data.split(/\n/).slice(1);
        let headers = data
            .split(/\n/)
            .splice(0, csvRows.length)[0]
            .split(this.props.separator);
        let xKey,
            yKey = undefined;

        // Récupération des index de la colonne X et Y
        for (let header in headers) {
            let field = headers[header].toUpperCase();
            if (field === 'X') {
                xKey = header;
            } else if (field === 'Y') {
                yKey = header;
            }
        }

        // Création des features en fonction des lignes du CSV
        for (let i = 0; i < csvRows.length; i++) {
            let feature = {
                geometry: {
                    coordinates: [],
                    type: 'Point',
                },
                type: 'Feature',
                properties: {},
            };
            let elements = csvRows[i].split(this.props.separator);
            if (elements.length > 1) {
                feature.geometry.coordinates.push(parseFloat(elements[xKey]));
                feature.geometry.coordinates.push(parseFloat(elements[yKey]));

                delete elements[xKey];
                delete elements[yKey];

                for (let element in elements) {
                    feature.properties[headers[element].toUpperCase()] = elements[element];
                }

                features.push(feature);
            }
        }

        return features;
    };

    /**
     * Conversion de features en Shapefile
     * @param {Array} features tableau comportant les features
     */
    convertToShapefile = (features) => {
        const reprojectCollection = CoordinatesUtils.reprojectGeoJson(
            {
                type: 'FeatureCollection',
                features: features,
            },
            this.state.projection,
            'EPSG:4326'
        );

        ExportUtils.toShape(reprojectCollection.features, 'convert', this.state.projection);
    };

    /**
     * Méthode permettant d'extraire le contenu du fichier csv
     */
    submit = () => {
        let reader = new FileReader();
        reader.onload = () => {
            let features = this.csvToArrayOfGeometries(reader.result);
            this.convertToShapefile(features);
        };
        reader.readAsText(this.state.file, 'UTF-8');
    };

    /**
     * Changement du fichier lors de la sélection d'un nouveau fchier CSV
     * @param {MouseEvent} event Evénement au click lors du changement de fichier
     */
    fileChanged = (event) => {
        this.setState({ file: event[0] });
    };

    /**
     * Changement de projection
     * @param {MouseEvent} event L'événement contenant le nom de la nouvelle projection
     */
    handleChangeProjection = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    /**
     * Affiche la projection source
     * @return {ReactElement}
     */
    renderProjection() {
        let options = [];
        for (let option in prj) {
            let value = getName(option) || option;
            options.push(<option value={option}>{value}</option>);
        }
        return (
            <select value={this.state.projection} name="projection" onChange={(e) => this.handleChangeProjection(e)} className="form-control">
                {options}
            </select>
        );
    }

    /**
     * Rendu principal
     */
    render() {
        return this.props.visible ? (
            <Dialog id="csv2shapefile-dialog">
                <div key="header" role="header">
                    <GrDocumentCsv className="svg-color-white" style={{ width: '18px', marginRight: '14px' }} />
                    &nbsp; <Message msgId="csv2shapefile.dialog.title" />
                    <button key="close" onClick={this.props.onClose} className="close">
                        <Glyphicon glyph={'1-close'} />
                    </button>
                </div>
                <div key="body" className="panel-body" role="body">
                    <div className="dropzone">
                        <Dropzone rejectClassName="alert-danger" className="alert alert-info" onDrop={(e) => this.fileChanged(e)}>
                            <div className="dropzone-content" style={{ textAlign: 'center' }}>
                                <Message msgId="csv2shapefile.dialog.choose" />
                            </div>
                        </Dropzone>
                    </div>
                    <Alert className="alert alert-success">
                        <I18N.HTML msgId="csv2shapefile.explain" />
                    </Alert>
                    <Row style={{ textAlign: 'center' }}>
                        <Col xs={12}>
                            <p>
                                <Message msgId="csv2shapefile.dialog.projection" /> :
                            </p>
                            {this.renderProjection()}
                        </Col>
                    </Row>
                    <Row style={{ textAlign: 'center', marginTop: '15px' }}>
                        <Col xs={12}>
                            <button onClick={() => this.submit()} className="btn btn-primary">
                                <Message msgId="csv2shapefile.dialog.convert" />
                            </button>
                        </Col>
                    </Row>
                </div>
            </Dialog>
        ) : null;
    }
}

module.exports = Csv2Shapefile;
