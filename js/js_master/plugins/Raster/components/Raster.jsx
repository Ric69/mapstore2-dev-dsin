const React = require('react');
const PropTypes = require('prop-types');
const axios = require('axios');
const { isArray, isEmpty } = require('lodash');
const { Panel, Tooltip } = require('react-bootstrap');
const ContainerDimensions = require('react-container-dimensions').default;

const Portal = require('../../../../MapStore2/web/client/components/misc/Portal');
const ConfirmDialog = require('../../../../MapStore2/web/client/components/misc/ConfirmDialog');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const ConfigUtils = require('../../../../MapStore2/web/client/utils/ConfigUtils');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const OverlayTrigger = require('../../../../MapStore2/web/client/components/misc/OverlayTrigger');
const DockPanel = require('../../../../MapStore2/web/client/components/misc/panels/DockPanel');
const BorderLayout = require('../../../../MapStore2/web/client/components/layout/BorderLayout');
const RasterUtils = require('../utils');
const { BsFillGrid1X2Fill } = require('react-icons/bs');

class Raster extends React.Component {
    static propTypes = {
        active: PropTypes.bool,
        addLayer: PropTypes.func,
        addTile: PropTypes.func,
        changeEnabledStatus: PropTypes.func,
        changeExportFormat: PropTypes.func,
        changeExportGap: PropTypes.func,
        changeSelectedStatus: PropTypes.func,
        changeVisibleState: PropTypes.func,
        dockStyle: PropTypes.object,
        id: PropTypes.string,
        raster: PropTypes.object,
        removeTile: PropTypes.func,
        resetTiles: PropTypes.func,
        setConfig: PropTypes.func,
        setLayer: PropTypes.func,
        toggleControl: PropTypes.func,
        toggleLoading: PropTypes.func,
        toggleModal: PropTypes.func,
        toggleSupport: PropTypes.func,
        updateResults: PropTypes.func,
        width: PropTypes.number,
    };

    static defaultProps = {
        active: false,
        addLayer: () => {},
        addTile: () => {},
        changeEnabledStatus: () => {},
        changeExportFormat: () => {},
        changeExportGap: () => {},
        changeSelectedStatus: () => {},
        changeVisibleState: () => {},
        dockStyle: {},
        id: 'raster-downloader',
        raster: {},
        removeTile: () => {},
        resetTiles: () => {},
        setConfig: () => {},
        setLayer: () => {},
        toggleControl: () => {},
        toggleLoading: () => {},
        toggleModal: () => {},
        toggleSupport: () => {},
        updateResults: () => {},
        width: 660,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    state = {
        download: false,
    };

    /**
     * Au chargement du composant, on vérifie la configuration pour ce plugin
     * Si une seule couche a été configuré, on la défini par défaut
     * Sinon, on affichera un selecteur de couche
     */
    componentDidMount() {
        const config = ConfigUtils.getConfigProp('rasterOptions');
        if (config && config.layers && config.layers.length === 1) {
            this.props.setLayer(config.layers[0]);
        }
        this.props.setConfig(config);
    }

    /**
     * Permet de cacher ou afficher le plugin
     * Est lié au plugin Catalog
     * @param props
     */
    componentWillReceiveProps(props) {
        let right = document.getElementById('mapstore-toolbar-container').style.right;
        if (this.props.active) {
            right = this.props.width;
        }

        if (!this.props.active && !this.props.explorerActive) {
            document.getElementById('mapstore-toolbar-container').style.right = '0px';
        } else {
            document.getElementById('mapstore-toolbar-container').style.right = right + 'px';
        }
    }

    /**
     * Si l'on a le droit de lancer le téléchargement
     * @returns {boolean}
     */
    canDownload = () => {
        return !isEmpty(this.props.raster.tiles.filter((raster) => raster.enabled && raster.selected)) && this.props.raster.exportFormat !== '';
    };

    /**
     * Définir une nouvelle couche de sélection
     * @param e
     */
    changeLayerRaster = (e) => {
        this.props.setLayer(e.target.value);
    };

    /**
     * Coche toutes les dalles sélectionné
     */
    checkAll = () => {
        this.toggleRaster(this.props.raster.tiles, true);
    };

    /**
     * Vérifie les rasters et le format
     * @param e
     */
    checkFormat = (e) => {
        const format = e.target.value;

        this.props.changeExportFormat(format);
        if (format === '') {
            this.props.changeExportGap(false);
            this.props.raster.tiles.map((raster) => {
                this.props.changeEnabledStatus(raster.id, true);
            });

            return false;
        }
        this.props.toggleLoading();

        const data = {
            rasterType: format,
            layerName: this.props.raster.layerName,
            rasters: this.props.raster.tiles.map((raster) => ({
                id: raster.id_assemblage,
                name: raster.name,
            })),
            test: true,
        };

        this.rasterQuery({
            data,
        }).then((data) => {
            this.props.toggleLoading();

            this.props.raster.tiles.map((raster) => {
                if (!data.rasters.includes(raster.name)) {
                    this.props.changeEnabledStatus(raster.id, false);
                } else {
                    this.props.changeEnabledStatus(raster.id, true);
                }
            });
            this.props.changeExportGap(this.props.raster.length !== data.rasters.length);
        });
    };

    /**
     * Fermeture du widget
     * Suppression du groupe de couches
     */
    close = () => {
        this.props.toggleControl();
        this.props.resetTiles();
    };

    /**
     * Activation ou pas de la modal
     */
    confirmModal = () => {
        this.props.toggleModal();
    };

    /**
     * Active le mode de sélection sur la carte
     * @param e
     * @param mode
     */
    enableSelection = (e, mode) => {
        this.props.changeVisibleState();
        this.props.toggleSupport(mode);
    };

    /**
     *
     * @param e
     */
    exportSelection = (e) => {
        e.preventDefault();

        if (this.props.raster.exportFormat === '') {
            return false;
        }

        this.props.toggleLoading();
        const data = {
            rasterType: this.props.raster.exportFormat,
            layerName: this.props.raster.layerName,
            rasters: this.props.raster.tiles
                .filter((raster) => raster.enabled && raster.selected)
                .map((raster) => ({
                    id: raster.id_assemblage,
                    name: raster.name,
                })),
            test: false,
        };

        this.rasterQuery({
            data,
            responseType: 'blob',
        }).then((data) => {
            if (data.type && data.type === 'application/octet-stream') {
                this.updateDownloadStatus(true);
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'rasters.zip');
                document.body.appendChild(link);
                link.click();
            }
            setTimeout(() => {
                this.updateDownloadStatus(false);
            }, 4500);

            this.resetFormat();
            this.props.toggleLoading();
        });
    };

    /**
     *
     * @param params
     * @returns {*}
     */
    rasterQuery = (params) => {
        let url = ConfigUtils.getConfigProp('georchestraUrlRest') + '/cnr/rasterMultiple';
        let headers = {};
        if (params.headers) {
            headers = params.headers;
        }

        return axios({
            ...params,
            url,
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'text/plain;charset=UTF-8',
            },
        })
            .then((response) => response.data)
            .catch((error) => {
                this.props.toggleLoading();
            });
    };

    /**
     * Suppression de la sélection
     * Avec confirmation
     */
    reset = () => {
        this.resetFormat();
        this.props.changeExportGap(false);
        this.props.resetTiles();
        this.confirmModal();
    };

    /**
     * Mise à zéro du format
     */
    resetFormat = () => {
        this.props.changeExportFormat('');
    };

    /**
     * Effectue une recherche sur l'ensemble des données de la couche sélectionné
     * @param e
     */
    searchByName = (e) => {
        const options = this.props.raster.search[this.props.raster.layerName];
        const text = e.target.value;

        if (text.length > 2 && !isEmpty(options)) {
            const filterRaster = options.filter((opt) => !text || opt.value.toLowerCase().indexOf(text.toLowerCase()) !== -1);
            this.props.updateResults(filterRaster);
        }
    };

    /**
     * Affichage des résultats pour une couche
     * @returns {null|*}
     */
    showResults = () => {
        if (!isEmpty(this.props.raster.searchResults)) {
            return (
                <div className="name-results">
                    <ul>
                        {this.props.raster.searchResults.map((result) => (
                            <li onClick={() => this.searchResultAdded(result)}>{result.label}</li>
                        ))}
                    </ul>
                </div>
            );
        }

        return null;
    };

    /**
     * Ajoute le résultat
     * @param result
     */
    searchResultAdded = (result) => {
        this.props.toggleLoading();
        this.resetFormat();
        RasterUtils.findFeatures({
            request: {
                version: '2.0.0',
                typeNames: this.props.raster.layerName,
                srsname: 'EPSG:2154',
                featureID: result.id,
            },
            layerName: this.props.raster.layerName,
            addLayer: this.props.addLayer,
            addTile: this.props.addTile,
        })
            .then(() => {
                document.getElementById('search-results').value = '';
                this.props.toggleLoading();
                this.props.updateResults([]);
                this.props.raster.tiles.map((raster) => {
                    this.props.changeEnabledStatus(raster.id, true);
                });
            })
            .catch(() => {
                document.getElementById('search-results').value = '';
                this.props.toggleLoading();
                this.props.updateResults([]);
                this.props.raster.tiles.map((raster) => {
                    this.props.changeEnabledStatus(raster.id, true);
                });
            });
    };

    /**
     * Change le statut de sélection d'une ou plusieurs dalles
     * @param raster
     * @param status
     */
    toggleRaster = (raster, status) => {
        if (!isArray(raster)) {
            raster = [raster];
        }

        raster.map((raster) => {
            if (!raster.enabled) {
                return;
            }

            if (status === undefined) {
                status = !raster.selected;
            }
            this.props.changeSelectedStatus(raster.id, status);
        });
    };

    /**
     * Décoche toutes les dalles sélectionné
     */
    uncheckAll = () => {
        this.toggleRaster(this.props.raster.tiles, false);
    };

    /**
     *
     * @param status
     */
    updateDownloadStatus = (status) => {
        this.setState({
            download: status,
        });
    };

    /**
     * Rendu de la partie sélection d'une couche / sélection de l'outil de sélection des dalles
     * @returns {*}
     */
    renderSelector() {
        let layerSelector = [];

        /**
         * Si la configuration précise plusieurs couches
         * On affiche les couches et on laisse le choix à l'utilisateur
         */
        if (this.props.raster.config && this.props.raster.config.layers && this.props.raster.config.layers.length > 1) {
            layerSelector.push(<h3>{LocaleUtils.getMessageById(this.context.messages, 'raster.selection.chooseLayer')}</h3>);
            layerSelector.push(
                <select className="form-control" onChange={this.changeLayerRaster}>
                    {this.props.raster.config.layers.map((layer) => (
                        <option value={layer}>{layer}</option>
                    ))}
                </select>
            );
            layerSelector.push(<div className="separator" />);
        }

        return (
            <div id="raster-selector">
                <div className="row" style={{ marginBottom: '15px' }}>
                    <div className="col-lg-12">
                        <h2>{LocaleUtils.getMessageById(this.context.messages, 'raster.selection.title')}</h2>
                        <div className="alert alert-info">
                            {LocaleUtils.getMessageById(this.context.messages, 'raster.selection.selectedLayer')} :{' '}
                            <b>{this.props.raster.layerName}</b>
                        </div>
                        {layerSelector}
                        <h3>{LocaleUtils.getMessageById(this.context.messages, 'raster.selection.subTitle')}</h3>
                        <div className="btn-group">
                            <OverlayTrigger
                                overlay={
                                    <Tooltip>
                                        <Message msgId="raster.selection.point" />
                                    </Tooltip>
                                }
                                placement="top">
                                <button type="button" className="btn btn-primary" onClick={(e) => this.enableSelection(e, 'Point')}>
                                    <span className="glyphicon glyphicon-point" />
                                </button>
                            </OverlayTrigger>
                            <OverlayTrigger
                                overlay={
                                    <Tooltip>
                                        <Message msgId="raster.selection.rectangle" />
                                    </Tooltip>
                                }
                                placement="top">
                                <button type="button" className="btn btn-primary" onClick={(e) => this.enableSelection(e, 'Polygon')}>
                                    <span className="glyphicon glyphicon-polygon" />
                                </button>
                            </OverlayTrigger>
                            <div className="btn-group pr">
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip>
                                            <Message msgId="raster.selection.name" />
                                        </Tooltip>
                                    }
                                    placement="top">
                                    <input
                                        id="search-results"
                                        className="form-control"
                                        type="text"
                                        placeholder={LocaleUtils.getMessageById(this.context.messages, 'raster.selection.name')}
                                        onChange={this.searchByName}
                                    />
                                </OverlayTrigger>
                                {this.showResults()}
                            </div>
                        </div>
                    </div>
                    <div className="clearfix" />
                </div>
            </div>
        );
    }

    /**
     * Rendu de la partie de sélection du format d'export
     */
    renderFormat() {
        const formats = this.props.raster.config.formats;
        const emptyOptions = {
            key: 'defaultFormat',
            value: '',
        };

        return (
            <div id="raster-format">
                <div className="row">
                    <div className="col-lg-12">
                        <h2>{LocaleUtils.getMessageById(this.context.messages, 'raster.formats.title')}</h2>
                        <h3>{LocaleUtils.getMessageById(this.context.messages, 'raster.formats.subTitle')}</h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <select
                            className="form-control"
                            name="export-format"
                            id="export-format"
                            onChange={this.checkFormat}
                            value={this.props.raster.exportFormat}>
                            <option {...emptyOptions}>{LocaleUtils.getMessageById(this.context.messages, 'raster.formats.choose')}</option>
                            {formats.map((format) => {
                                const options = {
                                    key: format,
                                    value: format,
                                };

                                return (
                                    <option {...options}>
                                        {LocaleUtils.getMessageById(this.context.messages, 'raster.formats.format')} {format}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Affichage de la Modal de confirmation
     * @returns {null|*}
     */
    renderModal() {
        if (this.props.raster.modal) {
            return (
                <Portal>
                    <ConfirmDialog
                        show
                        modal
                        onClose={this.confirmModal}
                        onConfirm={this.reset}
                        confirmButtonBSStyle="default"
                        closeGlyph="1-close"
                        title={<Message msgId="raster.confirm.title" />}
                        confirmButtonContent={<Message msgId="raster.confirm.confirm" />}
                        closeText={<Message msgId="raster.confirm.cancel" />}>
                        <Message msgId="raster.confirm.confirmText" />
                    </ConfirmDialog>
                </Portal>
            );
        }

        return null;
    }

    /**
     * Rendu de la partir d'affichage des résultats
     */
    renderResults() {
        if (isEmpty(this.props.raster.tiles)) {
            return (
                <div id="raster-results">
                    <h2>{LocaleUtils.getMessageById(this.context.messages, 'raster.listing.title')}</h2>
                    <div className="alert alert-warning">{LocaleUtils.getMessageById(this.context.messages, 'raster.listing.noData')}</div>
                </div>
            );
        }

        let list = [];
        this.props.raster.tiles.map((raster) => {
            let tooltip = null;
            if (
                raster.properties &&
                (raster.properties.INFOPROJ || raster.properties.INFORESOL || raster.properties.INFODATE || raster.properties.INFOTYPE)
            ) {
                tooltip = (
                    <Tooltip>
                        <ul style={{ padding: 0, margin: 0 }}>
                            {raster.properties.INFOPROJ ? (
                                <li>
                                    <Message msgId={'raster.listing.projection'} msgParams={{ data: raster.properties.INFOPROJ }} />
                                </li>
                            ) : null}
                            {raster.properties.INFORESOL ? (
                                <li>
                                    <Message msgId={'raster.listing.resolution'} msgParams={{ data: raster.properties.INFORESOL }} />
                                </li>
                            ) : null}
                            {raster.properties.INFODATE ? (
                                <li>
                                    <Message msgId={'raster.listing.date'} msgParams={{ data: raster.properties.INFODATE }} />
                                </li>
                            ) : null}
                            {raster.properties.INFOTYPE ? (
                                <li>
                                    <Message msgId={'raster.listing.type'} msgParams={{ data: raster.properties.INFOTYPE }} />{' '}
                                </li>
                            ) : null}
                        </ul>
                    </Tooltip>
                );
            }

            const labelRaster = (
                <label onClick={() => this.toggleRaster(raster)} style={{ cursor: 'pointer' }}>
                    {raster.name}
                </label>
            );

            list.push(
                <div key={raster.id} className="col-lg-6">
                    <div className={'row' + (raster.selected ? '' : ' row-disabled') + (raster.enabled ? '' : ' row-disabled row-uncheckabled')}>
                        <div className="col-lg-1">
                            <input
                                id={raster.id}
                                name={raster.id}
                                type="checkbox"
                                onChange={() => this.toggleRaster(raster)}
                                checked={!raster.enabled ? false : raster.selected}
                            />
                        </div>
                        <div className="col-lg-10">
                            {tooltip === null ? (
                                labelRaster
                            ) : (
                                <OverlayTrigger overlay={tooltip} placement="top">
                                    {labelRaster}
                                </OverlayTrigger>
                            )}
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <div id="raster-results">
                <div className="row" style={{ marginBottom: '10px' }}>
                    <div className="col-lg-12">
                        <h2>{LocaleUtils.getMessageById(this.context.messages, 'raster.listing.title')}</h2>
                        <h3>{LocaleUtils.getMessageById(this.context.messages, 'raster.listing.checkUncheck')}</h3>
                        {this.props.raster.exportGap && this.props.raster.exportFormat ? (
                            <div className="alert alert-warning" style={{ margin: 0 }}>
                                <Message msgId="raster.listing.noFormat" msgParams={{ format: this.props.raster.exportFormat }} />
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="row" style={{ marginBottom: '15px' }}>
                    <div className="col-lg-12">
                        <button type="button" className="btn btn-info" onClick={this.checkAll}>
                            <span className="glyphicon glyphicon-check" />
                            &nbsp;{LocaleUtils.getMessageById(this.context.messages, 'raster.listing.check')}
                        </button>
                        <button type="button" className="btn btn-warning" onClick={this.uncheckAll}>
                            <span className="glyphicon glyphicon-unchecked" />
                            &nbsp;{LocaleUtils.getMessageById(this.context.messages, 'raster.listing.uncheck')}
                        </button>
                        <button type="button" className="btn btn-danger" onClick={this.confirmModal}>
                            <span className="glyphicon glyphicon-trash" />
                            &nbsp;{LocaleUtils.getMessageById(this.context.messages, 'raster.listing.trash')}
                        </button>
                    </div>
                    <div className="clearfix" />
                </div>
                <div className="row-fluid">
                    {list}
                    <div className="clearfix" />
                </div>
                <div className="row-fluid">
                    <div className="col-12">
                        <p>&nbsp;</p>
                        <i>{LocaleUtils.getMessageById(this.context.messages, 'raster.listing.infotool')}</i>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Rendu du la partie d'export
     * @returns {*}
     */
    renderFooter() {
        let buttonParams = {
            type: 'button',
            className: 'btn btn-primary',
            onClick: this.exportSelection,
        };
        if (!this.canDownload() || this.props.raster.exportFormat === '') {
            buttonParams['disabled'] = 'disabled';
        }

        return (
            <div id="raster-footer">
                {this.state.download === true ? (
                    <div className="alert alert-info">
                        <Message msgId="raster.browserDownload" />
                    </div>
                ) : null}
                {!this.canDownload() && this.props.raster.exportFormat !== '' ? (
                    <div className="alert alert-danger">
                        <Message msgId="raster.noExport" />
                    </div>
                ) : null}
                <button {...buttonParams}>
                    <span className="glyphicon glyphicon-export" />
                    &nbsp;{LocaleUtils.getMessageById(this.context.messages, 'raster.exportTiles')}
                </button>
            </div>
        );
    }

    /**
     * Rendu des différentes partie du plugin
     * @returns {*}
     */
    renderBody() {
        return (
            <div id="raster-body" style={{ position: 'relative' }}>
                {this.renderModal()}
                {this.props.raster.loading ? (
                    <div id="panel-loader">
                        <div className="_ms2_init_spinner _ms2_init_center">
                            <div className="_ms2_init_text _ms2_init_center" />
                        </div>
                    </div>
                ) : null}
                {this.renderSelector()}
                <div className="separator" />
                {this.renderResults()}
                <div className="separator" />
                {this.renderFormat()}
                {this.renderFooter()}
            </div>
        );
    }

    /**
     * Rendu du containe
     * @returns {*}
     */
    renderContainer() {
        return (
            <div id="rasters-widget" style={{ width: '100%', height: '100%', pointerEvents: 'none', position: 'absolute' }}>
                <ContainerDimensions key="raster-container">
                    {({ width }) => (
                        <DockPanel
                            key="raster-dockpanel"
                            open={this.props.active}
                            size={this.props.width / width > 1 ? width : this.props.width}
                            position="right"
                            bsStyle="primary"
                            title={<Message msgId="raster.title" />}
                            onClose={this.close}
                            glyph="plus-square"
                            icon={<BsFillGrid1X2Fill style={{ fontSize: '2em' }} />}
                            style={this.props.dockStyle}>
                            <Panel id={this.props.id} style={{ zIndex: 100, overflow: 'hidden', height: '100%' }} className={'raster-panel'}>
                                <BorderLayout key="raster-border-layout">{this.renderBody()}</BorderLayout>
                            </Panel>
                        </DockPanel>
                    )}
                </ContainerDimensions>
            </div>
        );
    }

    /**
     * Rendu globale du plugin
     * Le rendu ne s'affiche que si le plugin est actif
     * @returns {null|HTML}
     */
    render() {
        if (this.props.active) {
            return this.renderContainer();
        }

        return null;
    }
}

module.exports = Raster;
