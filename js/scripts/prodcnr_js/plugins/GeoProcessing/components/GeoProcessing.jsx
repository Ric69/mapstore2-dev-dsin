const React = require('react');
const PropTypes = require('prop-types');
const { Button, Grid, Row, Col, FormGroup, ControlLabel, Glyphicon } = require('react-bootstrap');
const uuidv1 = require('uuid/v1');
const { isEmpty } = require('lodash');

const { getDefaultStyle } = require('../../../../MapStore2/web/client/components/map/openlayers/VectorStyle');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const ConfigUtils = require('../../../../MapStore2/web/client/utils/ConfigUtils');
const CoordinatesUtils = require('../../../../MapStore2/web/client/utils/CoordinatesUtils');
const StringUtils = require('../../../utils/StringUtils');
const DrawUtils = require('../../../utils/DrawUtils').default;
const Dialog = require('../../../../MapStore2/web/client/components/misc/Dialog');
const Message = require('../../../../MapStore2/web/client/plugins/locale/Message');
const GeoProcess = require('../utils/GeoProcess');
const { FaTools } = require('react-icons/fa');

class GeoProcessing extends React.Component {
    static propTypes = {
        changeLayer: PropTypes.func,
        changeSelectedProcess: PropTypes.func,
        nameSeparator: PropTypes.string,
        toggleControl: PropTypes.func,
        tools: PropTypes.object,
    };

    static defaultProps = {
        changeLayer: () => {},
        changeSelectedProcess: () => {},
        nameSeparator: ' > ',
        toggleControl: () => {},
        /**
         * Différents outils
         * @var {object}
         */
        tools: {
            cut: {
                label: 'geoprocessing.options.cut',
                value: 'geo:splitPolygon',
            },
            diff: {
                label: 'geoprocessing.options.diff',
                value: 'geo:difference',
            },
            union: {
                label: 'geoprocessing.options.union',
                value: 'gs:UnionFeatureCollection',
            },
            intersect: {
                label: 'geoprocessing.options.intersect',
                value: 'gs:IntersectionFeatureCollection',
            },
            group: {
                label: 'geoprocessing.options.group',
                value: 'group',
            },
            buffer: {
                label: 'geoprocessing.options.buffer',
                value: 'geo:buffer', // 'turfjs:buffer'
            },
        },
        /**
         * Messages descriptifs par outils
         * @var {object}
         */
        helpers: {
            'gs:IntersectionFeatureCollection': 'geoprocessing.helpers.intersect',
            'geo:splitPolygon': 'geoprocessing.helpers.split',
            'gs:UnionFeatureCollection': 'geoprocessing.helpers.union',
            'geo:difference': 'geoprocessing.helpers.diff',
            group: 'geoprocessing.helpers.group',
            'geo:buffer': 'geoprocessing.helpers.buffer',
        },
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    state = {
        attribute: '',
        attributes: [],
        dest: null,
        error: '',
        loading: false,
        layers: null,
        source: null,
        success: '',
    };

    componentDidMount() {
        this.setState({
            source: this.props.geoprocessing.sourceLayer,
            dest: this.props.geoprocessing.destLayer,
        });
    }

    componentWillReceiveProps(newProps) {
        if (this.state.source !== newProps.geoprocessing.sourceLayer) {
            this.setState({
                source: newProps.geoprocessing.sourceLayer,
            });
        }

        if (this.state.dest !== newProps.geoprocessing.destLayer) {
            this.setState({
                dest: newProps.geoprocessing.destLayer,
            });
        }
    }

    /**
     * Mise à jour de l'attribut selectionné
     * @param event
     */
    changeAttribute = (event) => {
        this.setState({
            attribute: event.target.value,
        });
    };

    /**
     * Mise à jour du layer selectionné
     * @param event
     */
    changeLayer = (event) => {
        const index = event.target.selectedIndex;
        this.props.changeLayer(event.target.value, event.target.name, event.target[index].text);

        /**
         * On récupère la liste des attributs d'une couche
         * Pour l'outil de recherche par attribut
         */
        if (this.isGroupAttribute()) {
            this.setState({
                loading: true,
            });
            GeoProcess.getSourceWFS({
                request: 'describeFeatureType',
                version: '1.3.0',
                typeName: event.target.value,
            })
                .then((response) => {
                    if (typeof response.data === 'object') {
                        let attributes = [];
                        const properties = response.data.featureTypes[0].properties;

                        properties.map((property) => {
                            attributes.push({
                                name: property.name,
                            });
                        });

                        this.setState({
                            loading: false,
                            success: '',
                            error: '',
                            attributes: attributes,
                        });
                    } else {
                        this.setState({
                            loading: false,
                            error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.errorLayersAttributes'),
                            success: '',
                        });
                    }
                })
                .catch((error) => {
                    this.setState({
                        loading: false,
                        error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.errorLayersAttributes'),
                        success: '',
                    });
                });
        }
    };

    /**
     * Mise à jour du choix de l'outil de traitement
     * @param event
     */
    changeTools = (event) => {
        // Modifie l'outil choisi
        this.props.changeSelectedProcess(event.target.value);
        // On remet à zéro le choix des couches pour le regroupement
        if (event.target.value === this.props.tools.group.value) {
            this.props.changeLayer('', 'sourceLayer', '');
        }
    };

    /**
     * Filtrage des couches de l'application
     * On ne gère que les couches géré sur leur geoserver, ou les couches de géométrie vectorielle
     * @returns {*}
     */
    filterLayers = () => {
        const mainUrl = ConfigUtils.getConfigProp('mainNdd');
        const layers = (this.props.layers && this.props.layers.flat) || [];

        const newLayers = layers
            .filter((layer) => {
                if (layer.group !== 'background') {
                    return layer;
                }
            })
            .filter((layer) => {
                if (['wfs', 'vector'].includes(layer.type) && !layer.url) {
                    return layer;
                }

                if (layer.url && layer.url.includes(mainUrl)) {
                    return layer;
                }
            });

        /**
         * Affichage par ordre alphabétique
         */
        newLayers.sort((a, b) => {
            let nameA = (a.title || a.name).toLowerCase(),
                nameB = (b.title || b.name).toLowerCase();
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
     * Liste l'ensemble des couches
     *
     * @returns Object
     */
    getLayers = (layers, excludeLayer, onlyVector = false) => {
        if (isEmpty(layers)) {
            return layers;
        }

        return layers
            .filter((layer) => {
                const id = layer.name || layer.id;
                if (onlyVector) {
                    if (layer.type === 'wfs' || layer.type === 'vector') {
                        return layer;
                    }
                } else {
                    return layer;
                }
            })
            .map((layer) => {
                const id = layer.name || layer.id;

                return {
                    label: layer.title || layer.name,
                    value: id,
                };
            });
    };

    /**
     * Liste l'ensemble des outils de geotraitement
     *
     * @returns Object
     */
    getTools = () => {
        return Object.keys(this.props.tools).map((tool) => {
            return {
                label: LocaleUtils.getMessageById(this.context.messages, this.props.tools[tool].label),
                value: this.props.tools[tool].value,
            };
        });
    };

    /**
     * L'outil sélectionné est celui pour zone tampon
     * @returns {boolean}
     */
    isBuffer = () => {
        return this.props.geoprocessing.selectedTool === this.props.tools.buffer.value;
    };

    /**
     * L'outil sélectionné est celui pour regroupement par attribut
     * @returns {boolean}
     */
    isGroupAttribute = () => {
        return this.props.geoprocessing.selectedTool === this.props.tools.group.value;
    };

    /**
     * L'outil sélectionné est celui pour couper
     * @returns {boolean}
     */
    isSplit = () => {
        return this.props.geoprocessing.selectedTool === this.props.tools.cut.value;
    };

    /**
     * Affichage des couches
     * @param value
     * @param label
     * @param key
     * @param excludeLayer
     * @returns {*}
     */
    listLayers = (value, label, key, excludeLayer) => {
        let layers = this.filterLayers();

        let selected = '';
        if (value === '' || value === null) {
            selected = 'selected';
        }

        return (
            <FormGroup className="geoprocessing-control-layers">
                <ControlLabel>{LocaleUtils.getMessageById(this.context.messages, label)}</ControlLabel>
                <select name={key} className="form-control" onChange={this.changeLayer}>
                    <option value="" selected={selected}>
                        {LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.form.layer')}
                    </option>
                    {this.getLayers(layers, excludeLayer).map((layer) => (
                        <option value={layer.value}>{layer.label}</option>
                    ))}
                </select>
            </FormGroup>
        );
    };

    /**
     * Vérification des différents champs de saisie
     * @returns {boolean}
     */
    checkForm = () => {
        const tool = this.props.geoprocessing.selectedTool;
        const GeoSourceLayer = this.props.geoprocessing.sourceLayer;
        const GeoDestLayer = this.props.geoprocessing.destLayer;
        const noSource = GeoSourceLayer === null || GeoSourceLayer === '';
        const noDest = GeoDestLayer === null || GeoDestLayer === '';

        // On vérifie qu'un outil a bien été sélectionné
        if (tool === null || tool === '') {
            this.setState({ loading: false, error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.errorTool'), success: '' });

            return false;
        }

        // On vérifie si les couches ont bien été sélectionné
        if (!this.isGroupAttribute() && !this.isBuffer()) {
            if (noSource || noDest) {
                this.setState({ loading: false, error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.errorLayers'), success: '' });

                return false;
            }
        }

        // Il faut 1 couche source
        if (this.isBuffer() || this.isGroupAttribute()) {
            if (noSource) {
                this.setState({ loading: false, error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.errorLayers'), success: '' });

                return false;
            }
        }

        // Il faut une unité de mesure
        if (this.isBuffer()) {
            const distance = parseFloat(document.getElementById('distance').value.replace(',', '.'));
            if (distance <= 0 || Number.isNaN(distance)) {
                this.setState({ loading: false, error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.errorBuffer'), success: '' });

                return false;
            }
        }

        // Il faut des attributs
        if (this.isGroupAttribute()) {
            if (this.state.attribute === '' || this.state.attribute === null) {
                this.setState({ loading: false, error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.errorGroup'), success: '' });

                return false;
            }
        }

        return true;
    };

    /**
     * On utilise l'outil WPS de Geoserver (plugin)
     * Les couches fonctionnent de différente façon:
     * - SUBPROCESS car les couches provenant de la base Oracle n'arrivent pas à être traité par les process gs:intersectionFeature, etc...
     * On utilise donc "CollectGeometries" pour créer un seul élément par couche
     * - WFS/couches utilistateur car certains outils attendent des géométries
     *
     * C'est l'object GeoProcess qui va gérer les différents process
     * Ici on ne traite que la réponse
     */
    process = () => {
        const tool = this.props.geoprocessing.selectedTool;
        let projection = 'EPSG:4326';
        this.setState({ loading: true, error: '', success: '' });

        if (!this.checkForm()) {
            return false;
        }

        if (this.isGroupAttribute()) {
            GeoProcess.getSourceWFS({
                typeName: this.state.source,
            })
                .then((response) => {
                    if (typeof response.data === 'object') {
                        let results = {};
                        const features = response.data.features;
                        const attribute = this.state.attribute;

                        features.map((feature) => {
                            const properties = feature.properties;
                            const key = properties[attribute];

                            if (key) {
                                if (!results[key]) {
                                    results[key] = {
                                        result: key,
                                        features: [],
                                    };
                                }
                                results[key].features.push(feature);
                            }
                        });

                        if (!isEmpty(results)) {
                            const groupId = uuidv1();
                            this.props.updateGroup(
                                groupId,
                                this.props.geoprocessing.names['sourceLayer'] +
                                    ' ' +
                                    attribute +
                                    ' (' +
                                    LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.options.group') +
                                    ')'
                            );

                            Object.keys(results).map((objectKey, index) => {
                                const value = results[objectKey];
                                const title = (typeof value.result === 'number' ? value.result.toString() : value.result) + ' (' + attribute + ')';
                                let geoJson = {
                                    crs: {
                                        properties: { name: 'EPSG:3857' },
                                        type: 'name',
                                    },
                                    type: 'FeatureCollection',
                                    features: value.features,
                                };
                                geoJson = CoordinatesUtils.reprojectGeoJson(geoJson, 'EPSG:2154', 'EPSG:3857');

                                const geometryExtent = DrawUtils.getExtent(geoJson);
                                this.props.addLayer({
                                    bbox: {
                                        bounds: {
                                            minx: geometryExtent[0],
                                            miny: geometryExtent[1],
                                            maxx: geometryExtent[2],
                                            maxy: geometryExtent[3],
                                        },
                                        crs: 'EPSG:3857',
                                    },
                                    type: 'wfs',
                                    geoJson: geoJson,
                                    id: uuidv1(),
                                    title: title,
                                    name: title,
                                    group: groupId,
                                    visibility: true,
                                    opacity: 1,
                                });
                            });

                            this.setState({
                                error: '',
                                success: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.addLayers'),
                            });
                        } else {
                            this.setState({
                                error: <Message msgId="geoprocessing.errorGroup" msgParams={{ attribute }} />,
                                success: '',
                            });
                        }
                        this.setState({
                            loading: false,
                        });
                    } else {
                        this.setState({
                            loading: false,
                            error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.error'),
                            success: '',
                        });
                    }
                })
                .catch((error) => {
                    this.setState({ loading: false, success: '', error });
                });

            return false;
        }

        let processData = {
            dest: this.state.dest,
            layers: this.props.layers.flat || [],
            source: this.state.source,
            tool,
            tools: this.props.tools,
        };

        if (document.getElementById('distance')) {
            processData['distance'] = document.getElementById('distance').value.replace(',', '.');
        }

        if (document.getElementById('distance-unit')) {
            processData['unit'] = document.getElementById('distance-unit').value;
        }

        const processPromise = GeoProcess.process(processData);
        processPromise
            .then((response) => {
                if (typeof response.data === 'object') {
                    let successMessage = '';
                    let geoJson = response.data;
                    const extent = DrawUtils.getExtent(geoJson);
                    // Suppression des features vides
                    if (geoJson.features) {
                        geoJson.features = geoJson.features
                            .filter((feature) => {
                                return !isEmpty(feature.geometry);
                            })
                            .map((feature) => {
                                if (feature.type !== 'Feature') {
                                    return {
                                        type: 'Feature',
                                        geometry: feature,
                                    };
                                }

                                return feature;
                            });
                    }
                    if (geoJson.type !== 'FeatureCollection') {
                        let newFeatures = [geoJson];
                        if (geoJson.type === 'GeometryCollection') {
                            newFeatures = geoJson.geometries.map((geometry) => {
                                return {
                                    type: 'Feature',
                                    geometry,
                                };
                            });
                        }
                        geoJson = {
                            crs: {
                                properties: { name: 'EPSG:3857' },
                                type: 'name',
                            },
                            type: 'FeatureCollection',
                            features: newFeatures.map((feature) => {
                                if (feature.type !== 'Feature') {
                                    return {
                                        type: 'Feature',
                                        geometry: feature,
                                    };
                                }

                                return feature;
                            }),
                        };
                    }

                    /**
                     * On vérifie l'existence des résultats
                     */
                    if (geoJson.type === 'FeatureCollection' && (!geoJson.features || geoJson.features.length < 1)) {
                        this.setState({
                            loading: false,
                            error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.noResultsToDraw'),
                            success: '',
                        });
                        this.resetState();

                        return false;
                    }

                    let label = 'geoprocessing.group';
                    let group = 'geoprocessing';
                    Object.keys(this.props.tools).filter((objectKey) => {
                        const result = this.props.tools[objectKey];
                        if (result.value === tool) {
                            group = objectKey;
                            label = result.label;
                        }
                    });

                    const geoProcessTitle =
                        LocaleUtils.getMessageById(this.context.messages, label) +
                        ' ' +
                        DrawUtils.generateId(DrawUtils.groupGeoProcess[group], { layers: this.props.layers });

                    this.props.updateGroup(DrawUtils.groupGeoProcess[group], LocaleUtils.getMessageById(this.context.messages, label));

                    if (tool === this.props.tools.cut.value) {
                        successMessage = LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.addLayers');

                        let x = 0;
                        geoJson.features.map((feature) => {
                            const geometryExtent = DrawUtils.getExtent(feature.geometry);

                            const newGeojson = {
                                crs: {
                                    properties: { name: 'EPSG:3857' },
                                    type: 'name',
                                },
                                type: 'FeatureCollection',
                                features: [feature],
                            };

                            this.props.addLayer({
                                bbox: {
                                    bounds: {
                                        minx: geometryExtent[0],
                                        miny: geometryExtent[1],
                                        maxx: geometryExtent[2],
                                        maxy: geometryExtent[3],
                                    },
                                    crs: 'EPSG:3857',
                                },
                                type: 'wfs',
                                geoJson: newGeojson,
                                id: uuidv1(),
                                name: geoProcessTitle + '-' + StringUtils.alphabetKey(x),
                                title: geoProcessTitle + '-' + StringUtils.alphabetKey(x),
                                group: DrawUtils.groupGeoProcess[group],
                                visibility: true,
                                opacity: 1,
                                style: getDefaultStyle(),
                            });
                            x++;
                        });
                    } else {
                        successMessage = LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.addLayer');
                        this.props.addLayer({
                            bbox: {
                                bounds: {
                                    minx: extent[0],
                                    miny: extent[1],
                                    maxx: extent[2],
                                    maxy: extent[3],
                                },
                                crs: 'EPSG:3857',
                            },
                            type: 'wfs',
                            geoJson: geoJson,
                            id: uuidv1(),
                            name: geoProcessTitle,
                            title: geoProcessTitle,
                            group: DrawUtils.groupGeoProcess[group],
                            visibility: true,
                            opacity: 1,
                            style: getDefaultStyle(),
                        });
                    }

                    this.setState({
                        error: '',
                        success: successMessage,
                    });
                    this.resetState();
                } else {
                    this.setState({
                        error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.possibleErrors'),
                        success: '',
                    });
                }
                this.setState({
                    loading: false,
                });
                this.resetState();
            })
            .catch((e) => {
                console.log(e);
                this.setState({
                    loading: false,
                    success: '',
                    error: LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.error'),
                });
                this.resetState();
            });
    };

    /**
     * Réinitialise les données du state par rapport aux événements du composant
     * Pour les messages d'information, et pour l'affichage du loader
     */
    resetState() {
        setTimeout(() => {
            this.setState({
                loading: false,
                success: '',
                error: '',
            });
        }, 8000);
    }

    /**
     * Affichage du 2nd paramètre
     * Pour la "zone tampon", affiche des informations pour la distance
     * Pour le "Regroupement', affiche les noms d'attributs
     * @returns {*}
     */
    renderDestination() {
        if (this.isBuffer()) {
            return (
                <Col xs={12} md={6}>
                    <Row>
                        <Col xs={12}>
                            <ControlLabel>{LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.form.distance')}</ControlLabel>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={6}>
                            <input id="distance" name="distance" className="form-control" />
                        </Col>
                        <Col xs={12} md={6}>
                            <select id="distance-unit" name="distance-unit" className="form-control">
                                <option value="m">
                                    {LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.form.distanceValues.meter')}
                                </option>
                                <option value="km">
                                    {LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.form.distanceValues.kilometer')}
                                </option>
                            </select>
                        </Col>
                    </Row>
                </Col>
            );
        } else if (this.isGroupAttribute()) {
            if (this.state.attributes.length > 0) {
                return (
                    <Col xs={12} md={6}>
                        <ControlLabel>{LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.form.attribute')}</ControlLabel>
                        <select name="attributes" className="form-control" onChange={this.changeAttribute}>
                            <option value="">{LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.form.selectAttributes')}</option>
                            {this.state.attributes.map((attribute) => (
                                <option value={attribute.name}>{attribute.name}</option>
                            ))}
                        </select>
                    </Col>
                );
            } else {
                return (
                    <Col xs={12} md={6}>
                        <p>&nbsp;</p>
                    </Col>
                );
            }
        } else {
            return (
                <Col xs={12} md={6}>
                    {this.listLayers(this.state.dest, 'geoprocessing.form.layerdist', 'destLayer', this.state.source)}
                </Col>
            );
        }
    }

    /**
     * Affichage du contenu de la modal
     * - Explication de l'outils et explication des différents outils selectionné
     * - Chaque outils affiche 2 selecteurs de couches
     * - Sauf "Zone tampon" qui demande une distance en 2nd paramètre
     * @returns {*}
     */
    renderBody() {
        let layers = this.filterLayers();
        if (layers.length <= 0) {
            return (
                <Grid fluid role="body">
                    <Row>
                        <Col xs={12}>
                            <div className="alert alert-info">
                                <Message msgId="geoprocessing.noLayers" />
                            </div>
                        </Col>
                    </Row>
                </Grid>
            );
        }

        return (
            <Grid fluid role="body">
                {this.state.loading ? (
                    <div id="panel-loader">
                        <div className="_ms2_init_spinner _ms2_init_center">
                            <div className="_ms2_init_text _ms2_init_center" />
                        </div>
                    </div>
                ) : (
                    ''
                )}
                <Row>
                    <Col xs={12}>
                        {this.props.geoprocessing.selectedTool !== '' && this.props.helpers[this.props.geoprocessing.selectedTool] ? (
                            <div className="alert alert-info">
                                {LocaleUtils.getMessageById(this.context.messages, this.props.helpers[this.props.geoprocessing.selectedTool])}
                            </div>
                        ) : (
                            <div>
                                <div className="alert alert-info" style={{ padding: '8px' }}>
                                    <Message msgId="geoprocessing.help" />
                                </div>
                                <div className="alert alert-warning" style={{ padding: '8px' }}>
                                    <Message msgId="geoprocessing.warning" />
                                </div>
                            </div>
                        )}
                        {this.state.error !== '' ? <div className="alert alert-danger">{this.state.error}</div> : ''}
                        {this.state.success !== '' ? <div className="alert alert-success">{this.state.success}</div> : ''}
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <FormGroup className="geoprocessing-control-tools">
                            <ControlLabel>{LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.form.tool')}</ControlLabel>
                            <select name="tools" className="form-control" onChange={this.changeTools}>
                                <option value="">{LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.form.tool')}</option>
                                {this.getTools().map((tool) => (
                                    <option value={tool.value}>{tool.label}</option>
                                ))}
                            </select>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={6}>
                        {this.listLayers(this.state.source, 'geoprocessing.form.layersource', 'sourceLayer', this.state.dest)}
                    </Col>
                    {this.renderDestination()}
                </Row>
                <Row>
                    <Col xs={12} style={{ textAlign: 'right' }}>
                        <Button id="geoprocessing-process" onClick={this.process} bsStyle="primary">
                            {LocaleUtils.getMessageById(this.context.messages, 'geoprocessing.form.button')}
                        </Button>
                    </Col>
                </Row>
            </Grid>
        );
    }

    /**
     * Affichage de la Modal
     * @returns HTML
     */
    renderDialog() {
        return (
            <Dialog id="geoprocessing-panel">
                <span role="header">
                    <FaTools color="#ffffff" style={{ width: '18px', marginRight: '14px' }} />
                    <span className="geoprocessing-panel-title">
                        <Message msgId="geoprocessing.paneltitle" />
                    </span>
                    <button onClick={this.props.toggleControl} className="geoprocessing-panel-close close">
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

module.exports = GeoProcessing;
