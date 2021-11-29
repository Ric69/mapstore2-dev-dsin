const React = require('react');
const PropTypes = require('prop-types');
const axios = require('axios');
const assign = require('object-assign');
const { head, isArray, isEmpty } = require('lodash');
const { Button, Grid, Row, Col, Glyphicon, FormGroup } = require('react-bootstrap');
const jsPDF = require('jspdf');

const Dialog = require('../../../../MapStore2/web/client/components/misc/Dialog');
const Message = require('../../../../MapStore2/web/client/plugins/locale/Message');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const MapUtils = require('../../../../MapStore2/web/client/utils/MapUtils');
const ConfigUtils = require('../../../../MapStore2/web/client/utils/ConfigUtils');
const CoordinatesUtils = require('../../../../MapStore2/web/client/utils/CoordinatesUtils');
const PrintUtils = require('../../../../MapStore2/web/client/utils/PrintUtils');
const StringUtils = require('../../../utils/StringUtils');
const { Name, Description, LogoType, Resolution, PrintSubmit, LandscapeSelect } = require('../../../../MapStore2/web/client/plugins/print/index');

/**
 * Mise en page Atlas dynamique
 */
class Atlas extends React.Component {
    static propTypes = {
        atlas: PropTypes.object,
        print: PropTypes.object,
        selectLayer: PropTypes.func,
        toggleControl: PropTypes.func,
        toggleInserting: PropTypes.func,
        visible: PropTypes.bool,
    };

    static defaultProps = {
        atlas: {},
        print: {},
        selectLayer: () => {},
        toggleControl: () => {},
        toggleInserting: () => {},
        visible: false,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    state = {
        loading: false,
        progression: [0, 0],
        alert: {
            msg: '',
            type: 'alert alert-info',
        },
        errorInPrinting: false,
        selected: undefined,
    };

    componentDidMount() {
        this.props.setPrintParameter('helpText', 0);
        this.props.setPrintParameter('portrait', true);
    }

    changeLayer = (event) => {
        this.props.selectLayer(event.target.value);
        this.setState({ selected: event.target.value });
    };

    /**
     * Modiifcation du nombre de caractères
     * @param e
     */
    changeDescriptionHelpText = (e) => {
        const charLeft = PrintUtils.changeDescriptionMaxLength(e.target);
        this.props.changeDescriptionLength(charLeft);
    };

    /**
     * Lecture du nombre de caractères restants
     * @returns {null|*}
     */
    readDescriptionHelpText = () => {
        const printSpec = this.props.print.spec;
        if (printSpec && printSpec.helpText && printSpec.helpText > 0) {
            return printSpec.helpText + LocaleUtils.getMessageById(this.context.messages, 'print.helpText');
        }

        return null;
    };

    /**
     * Action pour effectuer une selection sur la carte
     * @see js/services/AtlasSupport
     */
    doSelection = () => {
        if (this.props.atlas.layer !== '') {
            this.setState({ alert: { ...this.state.alert, msg: '' } });
            this.props.toggleSelection();
            this.props.toggleVisible();
        } else {
            this.setState({
                alert: assign({}, this.state.alert, { type: 'alert alert-danger', msg: 'atlas.selectOneLayer' }),
            });
        }
    };

    /**
     * On supprime les layers ENCART dans le rendu impression
     * @param layers
     */
    filterAtlasLayers = (layers) => {
        if (isEmpty(layers)) {
            return layers;
        }

        return layers.filter((layer) => {
            if (
                layer.name !== this.props.atlas.layer &&
                'cnr:' + layer.name !== this.props.atlas.layer &&
                layer.visibility &&
                !(layer.loadingError && layer.loadingError === 'Error')
            ) {
                return layer;
            }
        });
    };

    /**
     * Filtrage des couches de l'application
     * On ne gère que les couches géré sur leur geoserver, ou les couches de géométrie vectorielle
     * @returns {*}
     */
    filterLayers = () => {
        const mainUrl = ConfigUtils.getConfigProp('mainNdd');
        const layers = this.props.layers;

        if (isEmpty(layers)) {
            return layers;
        }

        const newLayers = layers
            .filter((layer) => {
                if (layer.group !== 'background' && layer.group !== 'geoprocessing' && layer.group !== 'drawing') {
                    return layer;
                }
            })
            .filter((layer) => {
                if ((layer.type === 'wms' || layer.type === 'wfs') && (layer.url && layer.url.includes(mainUrl))) {
                    return layer;
                }
            });

        /**
         * Affichage par ordre alphabétique
         */
        newLayers.sort((a, b) => {
            let nameA = a.title.toLowerCase(),
                nameB = b.title.toLowerCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            return 0;
        });

        return newLayers;
    };

    /**
     * Le nom du layout par rapport à son index
     * La page 1 sera différente des autres pages
     * @param index
     * @param orientation
     * @returns {string}
     */
    getPrintLayout = (index, orientation) => {
        return (index === 1 ? 'multiple_first' : 'multiple_page') + (orientation === 'portrait' ? '_portrait' : '');
    };

    /**
     * Obtenir l'échelle d'impression par rapport au zoom
     * @param mapZoom
     * @returns {float}
     */
    getScale(mapZoom) {
        const projection = 'EPSG:3857';

        const resolutions = MapUtils.getResolutions();
        const units = CoordinatesUtils.getUnits(projection);
        const dpm = 96 * (100 / 2.54);
        const scales = resolutions.map((resolution) => resolution * dpm * (units === 'degrees' ? 111194.87428468118 : 1));

        return scales[mapZoom];
    }

    /**
     * Taille de la carte
     * @param layout
     * @returns {{width: number, height: (*|number)}}
     */
    getMapSize(layout) {
        const currentLayout = head(this.props.print.capabilities.layouts.filter((l) => l.name === layout));

        return {
            width: 370,
            height:
                (currentLayout &&
                    currentLayout.map &&
                    currentLayout.map.height &&
                    currentLayout.map.width &&
                    (currentLayout.map.height / currentLayout.map.width) * 370) ||
                270,
        };
    }

    /**
     * Exécution de la requête de création d'un PDF
     * @returns Promise
     */
    getPrintPromise({ layout, scale, center, currentPage, totalPage }) {
        let layers = this.filterAtlasLayers(this.props.layers);
        const projectedCenter = CoordinatesUtils.reproject(center, center.crs || 'EPSG:2154', 'EPSG:3857');

        return axios.post(PrintUtils.transformUrl(this.props.print.capabilities.createURL), {
            units: 'm',
            srs: 'EPSG:3857',
            layout,
            dpi: parseInt(this.props.print.spec.resolution),
            outputFormat: 'png',
            geodetic: false,
            logotype: this.props.print.spec.logotype,
            mapTitle: this.props.print.spec.name,
            comment: this.props.print.spec.description,
            currentPage,
            totalPage,
            layers: PrintUtils.getMapfishLayersSpecification(layers, this.props.print.spec, 'map', this.props.vectors),
            pages: [
                {
                    center: [projectedCenter.x, projectedCenter.y],
                    scale: scale,
                    rotation: 0,
                },
            ],
            legends: PrintUtils.getMapfishLayersSpecification(layers, this.props.print.spec, 'legend'),
        });
    }

    /**
     * Affichage des couches
     */
    listLayers = () => {
        const key = 'atlas-layer';
        let layers = this.filterLayers();

        return (
            <FormGroup className="geoprocessing-control-layers">
                <select name={key} className="form-control" onChange={(e) => this.changeLayer(e)}>
                    <option value="">{LocaleUtils.getMessageById(this.context.messages, 'atlas.selector.layer')}</option>
                    {layers.map((layer) => (
                        <option value={layer.name || layer.id} selected={this.state.selected === (layer.name || layer.id)}>
                            {layer.title}
                        </option>
                    ))}
                </select>
            </FormGroup>
        );
    };

    /**
     * Dans le cas de l'ordre de traitement de l'objet
     * Un objet n'est pas traité dans l'ordre d'affichage, contrairement au tableau
     * @param layers
     * @returns {Array}
     */
    toArray = (layers) => {
        let array = [];

        for (let layerId in layers) {
            const layer = layers[layerId];
            const layerSplit = layerId.split('.');
            array.push({
                id: parseInt(layerSplit[1]),
                name: layerId,
                extent: layer.extent,
                crs: layer.crs,
            });
        }

        /**
         * Affichage par ordre alphabétique
         */
        array.sort((a, b) => {
            let nameA = a.id,
                nameB = b.id;
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            return 0;
        });

        // Ajout de la légende
        array.push({
            id: array[array.length - 1]['id'] + 1,
            name: array[array.length - 1]['id'] + 1,
            extent: [-9.86, 41.15, 10.38, 51.56],
            crs: 'EPSG:3857',
            layout: 'multiple_legend',
        });

        return array;
    };

    /**
     * Création du PDF
     * @return
     */
    process = () => {
        let orientation = 'landscape';
        if (this.props.print.spec.portrait) {
            orientation = 'portrait';
        }
        let pdf = new jsPDF({
            format: 'a4',
            orientation,
        });
        let i = 1;
        let currentPage = i;
        const promises = [];
        const totalPage = Object.keys(this.props.atlas.layers).length;
        this.setState({
            loading: true,
            errorInPrinting: false,
            progression: [0, totalPage * 2 + 1],
        });

        /**
         * On ajoute l'ensemble des requêtes dans un tableau
         * Pour ensuite effectuer le traitement dans l'ordre de création des pages
         */
        const orderedLayers = {};
        Object.keys(this.props.atlas.layers)
            .sort()
            .forEach((key) => {
                orderedLayers[key] = this.props.atlas.layers[key];
            });

        let layoutIncrement = 1;
        this.toArray(orderedLayers).map((layer) => {
            let layout = this.getPrintLayout(layoutIncrement, orientation);
            if (layer.layout) {
                layout = layer.layout;
            }
            const bbox = CoordinatesUtils.reprojectBbox(layer.extent, 'EPSG:2154', 'EPSG:3857');
            let zoom = MapUtils.getZoomForExtent(bbox, this.getMapSize(layout), 1, 20, this.props.print.spec.resolution);
            if (orientation === 'portrait') {
                zoom = zoom + 1;
            }
            const scale = this.getScale(zoom);

            promises.push({
                layout,
                scale,
                center: MapUtils.getCenterForExtent(layer.extent, layer.crs),
                currentPage,
                totalPage,
            });
            layoutIncrement++;
            currentPage++;
        });

        if (isArray(promises) && !isEmpty(promises) && !this.state.errorInPrinting) {
            // Temps d'interval entre chaque éxécution de promesse
            const promiseIntervalTimeout = 2500;
            const totalResponses = promises.length;
            let incrementResponses = 0;
            // Liste des pages éxécutés
            let pagesDo = [0];
            // Exécution en cours
            let doing = false;
            const promisesInterval = setInterval(() => {
                if (this.state.errorInPrinting) {
                    this.setState({
                        alert: assign({}, this.state.alert, { type: 'alert alert-danger', msg: 'atlas.error' }),
                        progression: [0, 0],
                        loading: false,
                        errorInPrinting: false,
                    });
                    clearInterval(promisesInterval);

                    return false;
                }

                if (incrementResponses >= totalResponses - 1) {
                    clearInterval(promisesInterval);
                }

                if (pagesDo.indexOf(incrementResponses) >= 0 && doing) {
                    return false;
                } else {
                    const promise = promises[incrementResponses];
                    doing = true;
                    this.getPrintPromise(promise)
                        .then((response) => {
                            return {
                                status: response.status,
                                url: PrintUtils.transformUrl(response.data.getURL),
                                index: promise.currentPage,
                            };
                        })
                        .then((result) => {
                            if (result && result.status === 200) {
                                const totalPage = promise.totalPage;
                                const currentPage = promise.currentPage;

                                StringUtils.convertImgToBase64URL(
                                    result.url,
                                    (base64Img) => {
                                        if (i > totalPage) {
                                            pdf.addImage(base64Img, 'PNG', 0, 0, 300, 210);
                                        } else if (orientation === 'portrait') {
                                            pdf.addImage(base64Img, 'PNG', 0, 0, 210, 300);
                                        } else {
                                            pdf.addImage(base64Img, 'PNG', 0, 0, 300, 210);
                                        }
                                        incrementResponses++;
                                        pagesDo.push(incrementResponses);

                                        this.setState({
                                            progression: [currentPage, totalPage + 1],
                                        });

                                        i++;
                                        if (i > totalPage + 1) {
                                            this.setState({
                                                progression: [0, 0],
                                            });

                                            pdf.save('atlas.pdf');
                                            this.props.resetLayers();

                                            this.setState({
                                                alert: {
                                                    msg: LocaleUtils.getMessageById(this.context.messages, 'atlas.browserDownload'),
                                                    type: 'alert alert-success',
                                                },
                                                loading: false,
                                            });

                                            return true;
                                        } else {
                                            if (i > totalPage) {
                                                // Ajout de la page avec la légende
                                                pdf.addPage('a4', 'landscape');
                                                doing = false;
                                            } else {
                                                pdf.addPage('a4', orientation);
                                                doing = false;
                                            }
                                        }
                                    },
                                    'image/png',
                                    () => {
                                        this.setState({
                                            alert: assign({}, this.state.alert, {
                                                type: 'alert alert-danger',
                                                msg: 'atlas.errorImg',
                                            }),
                                            loading: false,
                                        });
                                    }
                                );
                            }
                        })
                        .catch(() => {
                            this.setState({
                                errorInPrinting: true,
                                alert: assign({}, this.state.alert, { type: 'alert alert-danger', msg: 'atlas.error' }),
                                progression: [0, 0],
                                loading: false,
                            });
                        });
                }
            }, promiseIntervalTimeout);
        }
    };

    /**
     * Réinitialisation de l'atlas
     */
    reset = () => {
        if (confirm(LocaleUtils.getMessageById(this.context.messages, 'atlas.confirmReset'))) {
            this.setState({ alert: { ...this.state.alert, msg: '' } });
            this.props.resetLayers();
        }
    };

    /**
     * Affichage du contenu de la modal
     * @returns {*}
     */
    renderBody() {
        if (this.filterLayers().length <= 0) {
            return (
                <Grid fluid role="body">
                    <Row>
                        <Col xs={12}>
                            <div className="alert alert-info">
                                <Message msgId="atlas.noLayers" />
                            </div>
                        </Col>
                    </Row>
                </Grid>
            );
        }

        const withLoader =
            this.state.loading || this.props.atlas.loader ? { fluid: true, role: 'body', className: 'loading' } : { fluid: true, role: 'body' };
        const percent = Math.round((this.state.progression[0] * 100) / this.state.progression[1]) + '%';

        return (
            <Grid {...withLoader}>
                {this.state.loading || this.props.atlas.loader ? (
                    <div id="panel-loader">
                        {this.state.progression[1] > 0 ? <div className="progression-scale">{percent}</div> : null}
                        <div className="_ms2_init_spinner _ms2_init_center">
                            <div className="_ms2_init_text _ms2_init_center" />
                        </div>
                    </div>
                ) : (
                    ''
                )}
                {this.props.atlas.layers && Object.keys(this.props.atlas.layers).length > 0 ? (
                    this.renderPrintForm()
                ) : (
                    <div>
                        <div className="alert alert-warning">
                            <Message msgId="atlas.empty" />
                        </div>
                        <div className="alert alert-info">
                            <Message msgId="atlas.do" />
                        </div>
                    </div>
                )}
                {this.state.alert.msg !== '' ? (
                    <div className={this.state.alert.type}>
                        <Message msgId={this.state.alert.msg} />
                    </div>
                ) : null}
                <Row>
                    <Col xs={12} md={8}>
                        {this.listLayers()}
                    </Col>
                    <Col xs={12} md={4}>
                        <Button onClick={this.doSelection}>
                            <Message msgId="atlas.selector.launch" />
                        </Button>
                    </Col>
                </Row>
            </Grid>
        );
    }

    /**
     * Affichage du formulaire pour l'impression
     * @returns html
     */
    renderPrintForm() {
        const componentMsg = {
            msgId: 'atlas.selectedEntity',
            msgParams: {
                count: Object.keys(this.props.atlas.layers).length,
            },
        };
        if (componentMsg.msgParams.count > 1) {
            componentMsg.msgId = 'atlas.selectedEntities';
        }
        return (
            <div id="atlas-print-form">
                <Row>
                    <Col xs={12}>
                        <div className="alert alert-info" style={{ padding: '8px' }}>
                            <Message {...componentMsg} />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={6}>
                        <Name
                            label={LocaleUtils.getMessageById(this.context.messages, 'atlas.form.title')}
                            placeholder={LocaleUtils.getMessageById(this.context.messages, 'atlas.form.titleplaceholder')}
                        />
                        <Description
                            id="atlas-description"
                            maxLength={340}
                            onKeyUp={this.changeDescriptionHelpText}
                            helptext={this.readDescriptionHelpText()}
                            style={{ height: '180px' }}
                            label={LocaleUtils.getMessageById(this.context.messages, 'atlas.form.description')}
                            placeholder={LocaleUtils.getMessageById(this.context.messages, 'atlas.form.descriptionplaceholder')}
                        />
                    </Col>
                    <Col xs={12} md={6}>
                        <LogoType label={LocaleUtils.getMessageById(this.context.messages, 'atlas.form.logotype')} />
                        <div className="alert alert-warning" style={{ padding: '4px 6px' }}>
                            <Message msgId="atlas.chooseDisplayType" />
                        </div>
                        <LandscapeSelect
                            label={LocaleUtils.getMessageById(this.context.messages, 'atlas.form.mode')}
                            items={[
                                { name: LocaleUtils.getMessageById(this.context.messages, 'print.alternatives.landscape'), value: 'landscape' },
                                {
                                    name: LocaleUtils.getMessageById(this.context.messages, 'print.alternatives.portrait'),
                                    value: 'portrait',
                                },
                            ]}
                        />
                        <Resolution label={LocaleUtils.getMessageById(this.context.messages, 'atlas.form.resolution')} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <div className="alert alert-info" style={{ padding: '4px 6px' }}>
                            <Message msgId="atlas.geometriesOrder" />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <Button onClick={this.process}>
                            <Message msgId="atlas.print" />
                        </Button>
                    </Col>
                    <Col xs={6}>
                        <Button onClick={this.reset}>
                            <Message msgId="atlas.reset" />
                        </Button>
                    </Col>
                </Row>
                <div>&nbsp;</div>
            </div>
        );
    }

    /**
     * Affichage de la Modal
     * @returns HTML
     */
    renderDialog() {
        return (
            <Dialog id="atlas-panel">
                <span role="header">
                    <span className="atlas">
                        <Message msgId="atlas.title" />
                    </span>
                    <button onClick={this.props.toggleControl} className="atlas-panel-close close">
                        <Glyphicon glyph="1-close" />
                    </button>
                </span>
                {this.renderBody()}
            </Dialog>
        );
    }

    render() {
        if (this.props.visible) {
            return this.renderDialog();
        }

        return null;
    }
}

module.exports = Atlas;
