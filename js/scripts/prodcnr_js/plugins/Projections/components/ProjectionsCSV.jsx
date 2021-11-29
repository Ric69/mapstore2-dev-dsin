const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { Row, Col, Alert, Glyphicon } = require('react-bootstrap');
const Dropzone = require('react-dropzone');

const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const I18N = require('../../../../MapStore2/web/client/components/I18N/I18N');
const Dialog = require('../../../../MapStore2/web/client/components/misc/Dialog');
const CoordinatesUtils = require('../../../../MapStore2/web/client/utils/CoordinatesUtils');
const ProjectionsUtils = require('../../Projections/Utils/Projections');
const StringUtils = require('../../../utils/StringUtils');

require('./style.css');

class ProjectionsCSV extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            file: undefined,
            projections: [],
            firstProjection: undefined,
            lastProjection: undefined,
            error: '',
            headers: '',
        };
    }

    static propTypes = {
        projection: PropTypes.object,
        onClose: PropTypes.func,
        active: PropTypes.bool,
    };

    static defaultProps = {
        projection: {},
        onClose: () => {},
        active: false,
        separator: ';',
    };

    componentDidMount() {
        this.getListProjections();
    }

    /**
     * Méthode permettant de transformer des données au format CSV en tableau
     * @param {String} data Le CSV
     * @return {Array} Le tableau de données
     */
    csvToArray = (data) => {
        let csvArray = [];
        this.setState({
            headers: data.split(/\n/).slice(0, 1)[0],
        });
        let csvRows = data.split(/\n/).slice(1);

        for (let rowIndex = 0; rowIndex < csvRows.length; rowIndex++) {
            let rowArray = csvRows[rowIndex].split(this.props.separator);
            let rowObject = [];

            for (let propIndex = 0; propIndex < rowArray.length; propIndex++) {
                if (rowArray[propIndex] !== '') {
                    let propValue = rowArray[propIndex].replace(/^"|"$/g, '');
                    propValue = propValue.replace(/,/g, '.');
                    rowObject.push(propValue);
                }
            }
            if (rowObject.length > 0) {
                csvArray.push(rowObject);
            }
        }

        return csvArray;
    };

    /**
     * Conversion des coordonnées dans la projection choisie
     * @param {Array} dataCsv tableau comportant le CSV
     * @return {Array} Les données sous la nouvelle projection
     */
    convert = (dataCsv) => {
        let rows = [];
        let source = this.state.firstProjection;
        let dest = this.state.lastProjection;
        for (let i = 0; i < dataCsv.length; i++) {
            let p = [parseFloat(dataCsv[i][0]), parseFloat(dataCsv[i][1])];
            p = CoordinatesUtils.reproject(p, source, dest);
            rows.push([p.x, p.y, ...dataCsv[i].slice(2)]);
        }
        return rows;
    };

    /**
     * Méthode permettant de faire télécharger le fichier à l'utilisateur
     * @param {Array} rows Les coordonnées au bon format
     */
    saveCsv = (rows) => {
        const separator = this.props.separator;
        const csvBOM = 'data:text/csv;charset=utf-8,' + '\uFEFF';
        let csvContent = '';

        rows.forEach((rowArray) => {
            let row = rowArray.join(separator);
            csvContent += row + '\n';
        });

        const encodedUri = encodeURI(this.state.headers + '\n' + csvContent);
        let link = document.createElement('a');
        link.setAttribute('href', csvBOM + encodedUri);
        link.setAttribute('download', 'conversion_' + this.state.firstProjection + '_vers_' + this.state.lastProjection + '.csv');
        document.body.appendChild(link);
        link.click();
    };

    /**
     * Méthode permettant d'extraire le contenu du fichier csv
     */
    submit = () => {
        let reader = new FileReader();
        reader.onload = () => {
            let csvArray = this.csvToArray(reader.result);
            let rows = this.convert(csvArray);
            this.saveCsv(rows);
        };

        if (this.state.file !== undefined) {
            reader.readAsText(this.state.file, 'UTF-8');
            this.setState({ file: undefined, error: '' });
        } else {
            this.setState({ error: 'projection.noFile' });
        }
    };

    /**
     * Changement du fichier lors de la sélection d'un nouveau fchier CSV
     * @param {MouseEvent} event Evénement au click lors du changement de fichier
     */
    fileChanged = (event) => {
        this.setState({ file: event[0], error: '' });
    };

    /**
     * Permet de récupérer la liste complète des projections disponibles
     */
    getListProjections = () => {
        this.setState({
            projections: ProjectionsUtils.list,
            firstProjection: Object.keys(ProjectionsUtils.list)[0],
            lastProjection: Object.keys(ProjectionsUtils.list)[Object.keys(ProjectionsUtils.list).length - 1],
        });
    };

    /**
     * Changement de projection (méthode appellée à la fois pour la source & destination)
     * @param {MouseEvent} event L'événement contenant le nom de la nouvelle projection
     */
    handleChangeProjection = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    /**
     * Affiche la projection source
     * @return {ReactElement}
     */
    renderFirstProjection() {
        let options = [];
        for (let EPSG in this.state.projections) {
            options.push(<option value={EPSG}>{this.state.projections[EPSG]}</option>);
        }
        return (
            <select
                value={this.state.firstProjection}
                name="firstProjection"
                onChange={(e) => this.handleChangeProjection(e)}
                className="form-control">
                {options}
            </select>
        );
    }

    /**
     * Affiche la projection de destination
     * @return {ReactElement}
     */
    renderLastProjection() {
        let options = [];
        for (let EPSG in this.state.projections) {
            if (EPSG !== this.state.firstProjection) {
                options.push(<option value={EPSG}>{this.state.projections[EPSG]}</option>);
            }
        }
        return (
            <select value={this.state.lastProjection} name="lastProjection" onChange={(e) => this.handleChangeProjection(e)} className="form-control">
                {options}
            </select>
        );
    }

    render() {
        if (this.props.active) {
            return (
                <Dialog id="projection-panel">
                    <div key="header" role="header">
                        <Glyphicon glyph="random" />
                        &nbsp; <Message msgId="projection.title" />
                        <button key="close" onClick={this.props.onClose} className="close">
                            <Glyphicon glyph={'1-close'} />
                        </button>
                    </div>
                    <div key="body" className="panel-body" role="body">
                        {this.state.error !== '' ? (
                            <Alert className="alert alert-danger">
                                <Message msgId={this.state.error} />
                            </Alert>
                        ) : null}
                        <Dropzone
                            id="projections-files"
                            multiple={false}
                            disableClick={this.state.file}
                            rejectClassName="alert-danger"
                            className="alert alert-info"
                            onDrop={(e) => this.fileChanged(e)}>
                            <div className="dropzone-content" style={{ textAlign: 'center' }}>
                                {this.state.file ? <Message msgId="projection.fileOk" /> : <Message msgId="projection.chooseFile" />}
                            </div>
                        </Dropzone>
                        <Alert className="alert alert-success">
                            <I18N.HTML msgId="projection.explain" />
                        </Alert>
                        <Row style={{ textAlign: 'center' }}>
                            <Col xs={6}>
                                <div>
                                    <p>
                                        <Message msgId="projection.source" />
                                    </p>
                                    {this.renderFirstProjection()}
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div>
                                    <p>
                                        <Message msgId="projection.target" />
                                    </p>
                                    {this.renderLastProjection()}
                                </div>
                            </Col>
                        </Row>
                        <Row style={{ textAlign: 'center', marginTop: '15px' }}>
                            <Col xs={12}>
                                <button onClick={this.submit} className="btn btn-primary">
                                    <Message msgId="projection.convert" />
                                </button>
                            </Col>
                        </Row>
                    </div>
                </Dialog>
            );
        }
        return null;
    }
}

module.exports = ProjectionsCSV;
