const React = require('react');
const { TiChartAreaOutline } = require('react-icons/ti');
const { Glyphicon, Alert } = require('react-bootstrap');
const PropTypes = require('prop-types');
const { isEmpty } = require('lodash');
const DxfParser = require('dxf-parser').default;
const { LineString } = require('ol/geom');
const { Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart } = require('recharts');
const axios = require('axios');
const domToImage = require('dom-to-image');
const fileDownload = require('js-file-download');
const JsPDF = require('jspdf');

const Dialog = require('@mapstore/components/misc/Dialog');
const PrintUtils = require('@mapstore/utils/PrintUtils');
const CoordinatesUtils = require('@mapstore/utils/CoordinatesUtils');
const MapUtils = require('@mapstore/utils/MapUtils');
const ConfigUtils = require('@mapstore/utils/ConfigUtils');
const LocaleUtils = require('@mapstore/utils/LocaleUtils');
const StringUtils = require('../../../utils/StringUtils');
const Message = require('@mapstore/plugins/locale/Message');
const { getName } = require('../../Projections/Utils/Projections');
const FileUtils = require('@mapstore/utils/FileUtils');
const ProjectionsUtils = require('@js/plugins/Projections/Utils/Projections');

require('./style.css');

class Profile extends React.Component {
    static propTypes = {
        /**
         * Variables
         */
        active: PropTypes.bool,
        closeGlyph: PropTypes.string,
        geometry: PropTypes.object,
        map: PropTypes.object,
        print: PropTypes.object,
        show: PropTypes.bool,
        titleGlyph: PropTypes.string,
        elements: PropTypes.array,
        WFSLayers: PropTypes.array,
        layers: PropTypes.array,
        currentLocale: PropTypes.string,
        /**
         * Functions
         */
        onClose: PropTypes.func,
        changeMapView: PropTypes.func,
        toggleControl: PropTypes.func,
        updateCurrentPositionProfile: PropTypes.func,
        deactivate: PropTypes.func,
        drawProfile: PropTypes.func,
        changeGeometryProfile: PropTypes.func,
        configurePrintMap: PropTypes.func,
    };

    static defaultProps = {
        /**
         * Variables
         */
        active: false,
        closeGlyph: '1-close',
        geometry: {
            coordinates: [],
        },
        map: {},
        print: {},
        show: false,
        titleGlyph: 'stats',
        elements: ['profile', 'resume', 'settings'],
        WFSLayers: [],
        layers: [],
        currentLocale: 'fr-FR',
        /**
         * Functions
         */
        onClose: () => {},
        changeMapView: () => {},
        toggleControl: () => {},
        deactivate: () => {},
        onError: () => {},
        drawProfile: () => {},
        changeGeometryProfile: () => {},
        configurePrintMap: () => {},
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    state = {
        /**
         * La liste des données du graphique
         * @type {Array}
         */
        data: [],
        /**
         * Le message d'erreur à afficher
         * @type String
         */
        error: undefined,
        /**
         * Le message de succès à afficher
         * @type String
         */
        success: undefined,
        /**
         * La géometry effectué sur la carte pour générer le profil en long
         * @type {Object}
         */
        geometry: this.props.geometry || {},
        /**
         * Les informations du MNT
         * @type {Object}
         */
        informations: {},
        /**
         * La variable gérant le chargement du MNT
         * @type {Boolean}
         */
        loading: false,
        /**
         * Le nom du fichier MNT séléctionné
         * @type {String}
         */
        mnt_selected: [],
        /**
         * La liste des MNTs possible
         * @type {Array}
         */
        mnt_files: [],
        /**
         * Le nom du profil tracé
         * @type {String}
         */
        profileName: 'Mon profil en long',
        /**
         * L'onglet sélectionné
         * @type {String}
         */
        selectedElement: this.props.elements[0],
        /**
         * Le pas utilisé pour créer le profil en long
         * @type {Number}
         */
        step: 200,
        /**
         * La projection à utiliser
         * @type {String}
         */
        defaultProjection: '2154',

        /**
         * La projection de l'import
         * @type {String}
         */
        importProjection: undefined,

        /**
         * @type {String}
         */
        unit: 'm',
    };

    /**
     * Méthode réagissant aux changements des props
     * Permet de mettre à jour le graphique
     * @param {Object} nextProps La nouvelle version des props
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.geometry !== this.state.geometry && this.props.active) {
            this.setState({
                loading: true,
                success: undefined,
                error: undefined,
                geometry: nextProps.geometry,
            });

            let coordinates = [];
            if (nextProps.geometry && nextProps.geometry.id) {
                try {
                    let geometry2154 = this.reproject(nextProps.geometry, 'EPSG:3857', 'EPSG:2154');
                    geometry2154.coordinates.map((coord) => {
                        coordinates.push(coord.join(' '));
                    });
                    this.setState({
                        error: undefined,
                        success: undefined,
                    });
                    this.loadingProfile(coordinates, this.state.mnt_selected);
                } catch (e) {
                    console.log("Erreur nextProps.geometry", e);
                    this.setState({
                        loading: false,
                        success: undefined,
                        error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorLine'),
                        data: [],
                    });
                }
            } else {
                this.setState({
                    error: undefined,
                    data: [],
                });
            }
        }
        if (this.props.active && !nextProps.active) {
            this.props.deactivate();
        }
        if (this.props.elements !== nextProps.elements) {
            this.setState({ selectedElement: nextProps.elements[0] });
        }
    }

    /**
     * Méthode déclanchée lors de la création du composant
     * Permet de stocker la liste de fichiers MNT
     */
    componentDidMount() {
        axios
            .get(ConfigUtils.getConfigProp('georchestraUrlRest') + '/cnr/getMntList')
            .then((response) => {
                this.setState({
                    mnt_files: response.data.items,
                    mnt_selected: response.data.items.includes('BDALTI_75') ? 'BDALTI_75' : response.data.items[0],
                });
            })
            .catch(() =>
                this.props.onError({
                    title: 'notification.mnt.error.title',
                    message: 'notification.mnt.error.description',
                })
            );
    }

    /**
     * Méthode permettant de charger le profil en long
     * @param {Array} coordinates Tableau contenant les coordonnées X,Y
     * @param {String} mnt Le nom du MNT à utiliser
     */
    loadingProfile = (coordinates, mnt) => {
        let data = {
            distance: parseInt(this.state.step, 10),
            outputFormat: 'json',
            data: 'LINESTRING(' + coordinates.join(', ') + ')',
            referentiel: mnt,
            projection: this.state.defaultProjection,
            description: '',
        };

        axios
            .post(ConfigUtils.getConfigProp('georchestraUrlRest') + '/cnr/calculProfil', data, {
                headers: {
                    'Content-Type': 'text/plain',
                },
            })
            .then((response) => {
                let tmpData = [];
                let numberOfInvalidData = 0;

                if (response.data.profile) {
                    response.data.profile.map((element) => {
                        if (element[3] === -9999) {
                            numberOfInvalidData++;
                        } else {
                            tmpData.push({
                                name: Math.ceil(element[0]),
                                altitude: Math.ceil(element[3]),
                                amt: Math.ceil(element[4]),
                                x: element[1],
                                y: element[2],
                            });
                        }
                    });

                    tmpData.map((element) => {
                        const point = CoordinatesUtils.reproject([parseFloat(element.x), parseFloat(element.y)], 'EPSG:2154', 'EPSG:3857');
                        element.x = point.x;
                        element.y = point.y;
                    });

                    if (response.data.profile.length === numberOfInvalidData) {
                        this.setState({
                            loading: false,
                            success: undefined,
                            error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorLine'),
                            data: [],
                        });
                    } else {
                        this.setState({
                            data: tmpData,
                            informations: response.data.infos,
                            loading: false,
                            selectedElement: 'profile',
                            success: undefined,
                            error: undefined,
                        });
                    }
                } else {
                    this.setState({
                        loading: false,
                        success: undefined,
                        error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorLoading'),
                        data: [],
                    });
                }
            })
            .catch((e) => {
                console.error(LocaleUtils.getMessageById(this.context.messages, 'profile.errorTimeOut'), e);
                this.setState({
                    success: undefined,
                    loading: false,
                    error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorTimeOut'),
                    data: [],
                });
            });
    };

    /**
     * Méthode déclanchée lors du survol du graphique
     * @param {MouseEvent} event L'événement de souris
     */
    onMouseMove = (event) => {
        if (event.activePayload) {
            const { name, x, y } = event.activePayload[0].payload;
            this.props.updateCurrentPositionProfile({ name: name, x: x, y: y });
        }
    };

    /**
     * Méthode permettant de générer un slug à partir d'une chaîne de caractère
     * Ex : Compagnie Nationale Du Rhône => compagnie_nationale_du_rhone
     * @param {String} str La chaîne de caractère voulant être "slugifié"
     * @return {String} La chaîne sous forme de slug
     */
    stringToSlug = (str) => {
        str = str.replace(/^\s+|\s+$/g, '');
        str = str.toLowerCase();
        var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
        var to = 'aaaaeeeeiiiioooouuuunc------';
        for (var i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
        str = str
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        return str;
    };

    /**
     * Méthode permettant de générer un fichier CSV à partir de la liste des points du profil en long
     */
    generateCSV = () => {
        this.setState({ loading: true, error: undefined, success: undefined });
        let csv = 'data:text/csv;charset=utf-8,Distance(m);X;Y;Altitude(m)\n';
        this.state.data.map((element) => {
            csv += element.name + ';' + element.x + ';' + element.y + ';' + element.altitude + '\n';
        });
        let encodedUri = encodeURI(csv);
        let link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', this.stringToSlug(this.state.profileName) + '.csv');
        document.body.appendChild(link);
        link.click();
        this.setState({ loading: false, error: undefined, success: LocaleUtils.getMessageById(this.context.messages, 'profile.success') });
    };

    /**
     * Méthode permetant de générer une image PNG à partir de l'élément passé en paramètre
     * @param {HTMLElement} element Element HTML
     * @param {Function} callback La fonction de retour
     */
    generatePNG = (element, callback) => {
        domToImage.toBlob(element).then((blob) => {
            callback(blob);
        });
    };

    /**
     * Génére un PDF à partir de 2 images
     * L'image généré par GeoServer printing et celle du profil en long
     * @param {HTMLElement} element Element HTML
     */
    generatePDF = (element) => {
        this.setState({ loading: true, error: undefined, success: undefined });
        this.generatePNG(element, (blob) => {
            let pdf = new JsPDF();
            let url = URL.createObjectURL(blob);
            let img = new Image();
            img.src = url;

            const profileGeometry = this.props.geometry;
            let center = [46.739861, 2.891314];
            if (profileGeometry.center) {
                center = profileGeometry.center;
            } else if (profileGeometry.bbox) {
                const getCenter = MapUtils.getCenterForExtent(profileGeometry.bbox, profileGeometry.projection || 'EPSG:3857');
                center = [getCenter.x, getCenter.y];
            } else {
                const ProfilGeometry = new LineString(profileGeometry.coordinates);
                const getCenter = MapUtils.getCenterForExtent(ProfilGeometry.getExtent(), profileGeometry.projection || 'EPSG:3857');
                center = [getCenter.x, getCenter.y];
            }
            const projectedCenter = CoordinatesUtils.reproject(center, profileGeometry.projection || 'EPSG:4326', 'EPSG:3857');

            let layers = this.props.print.map.layers;
            if (this.props.WFSLayers.profile) {
                layers = this.props.print.map.layers.concat({
                    id: 'profile',
                    type: 'wfs',
                });
            }

            try {
                axios
                    .post(this.props.print.capabilities.createURL, {
                        units: 'm',
                        srs: 'EPSG:3857',
                        layout: 'profile',
                        dpi: 300,
                        outputFormat: 'png',
                        geodetic: false,
                        logotype: 'cnr_logo.jpg',
                        mapTitle: '',
                        comment: '',
                        layers: PrintUtils.getMapfishLayersSpecification(layers, this.props.print.spec, 'map', this.props.WFSLayers),
                        pages: [
                            {
                                center: [projectedCenter.x, projectedCenter.y],
                                scale: this.props.print.map.scale,
                                rotation: 0,
                            },
                        ],
                        legends: PrintUtils.getMapfishLayersSpecification(layers, this.props.print.spec, 'legend'),
                    })
                    .then((e) => {
                        StringUtils.convertImgToBase64URL(
                            PrintUtils.transformUrl(e.data.getURL),
                            (base64Img) => {
                                pdf.addImage(base64Img, 'PNG', 10, 110, img.clientWidth - 300, img.clientHeight - 300);
                                pdf.addImage(img, 'PNG', 0, 0, img.clientWidth, img.clientHeight);
                                pdf.save(this.state.profileName + '.pdf');
                                this.setState({
                                    loading: false,
                                    error: undefined,
                                    success: LocaleUtils.getMessageById(this.context.messages, 'profile.success'),
                                });
                            },
                            'image/png',
                            () => {
                                this.setState({
                                    loading: false,
                                    success: undefined,
                                    error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorPdf'),
                                });
                            }
                        );
                    })
                    .catch(() => {
                        this.setState({
                            loading: false,
                            success: undefined,
                            error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorPdf'),
                            data: [],
                        });
                    });
            } catch (e) {
                console.log('Erreur impression PDF', e);
                this.setState({
                    loading: false,
                    success: undefined,
                    error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorPdf'),
                    data: [],
                });
            }
        });
    };

    /**
     * Mise à jour des données du print
     */
    configurePrint = () => {
        const map = this.props.map;
        const scales = MapUtils.getScales(
            (map && map.projection) || 'EPSG:3857',
            (map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI) || null
        );
        const layers = (this.props.layers || []).filter((layer) => layer.visibility && ['google', 'bing'].indexOf(layer.type) === -1);

        this.props.configurePrintMap(map.center, map.zoom, map.zoom, scales[map.zoom], layers, map.projection, this.props.currentLocale);
    };

    /**
     * Méthode déclanchée lors du choix de l'export
     * @param {MouseEvent} event L'événement au click
     */
    exportChoice = (event) => {
        this.configurePrint();
        const format = event.target.value;
        event.target.selectedIndex = 0;

        switch (format) {
            case 'png':
                this.setState({ loading: true, error: undefined, success: undefined });
                this.generatePNG(document.getElementById('profile-side'), (blob) => {
                    fileDownload(blob, this.stringToSlug(this.state.profileName) + '.png');
                    this.setState({
                        loading: false,
                        error: undefined,
                        success: LocaleUtils.getMessageById(this.context.messages, 'profile.success'),
                    });
                });
                break;
            case 'csv':
                this.generateCSV();
                break;
            case 'pdf':
                this.generatePDF(document.getElementById('profile-side'));
                break;
            default:
                return null;
        }
    };

    /**
     * Méthode permettant de reprojeter les coordonnées
     * @param {Object} geometry La géométrie contenant les coordonnées initiales
     * @param {String} source La projection initiale
     * @param {String} dist La projection cible
     * @return {Object} La géométrie avec les coordonnées dans la nouvelle projection
     */
    reproject(geometry, source, dist) {
        return CoordinatesUtils.reprojectGeoJson(geometry, source, dist);
    }

    /**
     * Méthode gérant la validation du changement de MNT
     */
    handleMnt = () => {
        if (this.refs.mntSelected) {
            this.props.drawProfile(true);
            this.setState({ loading: true, success: undefined, error: undefined, mnt_selected: this.refs.mntSelected.value });
        }
    };

    /**
     * Méthode permettant de mettre à jour un contenu suite à une action au clavier
     * @param {KeyboardEvent} event L'événement de changement de contenu
     */
    handleInput = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    /**
     * Le contenu de la ToolTip du chart du Profile
     * @param payload
     * @returns {null|*}
     */
    getProfileContentTooltip = ({ payload }) => {
        const unit = this.state.unit;
        if (isEmpty(payload)) {
            return null;
        }

        if (!payload[0]) {
            return null;
        }

        const myChart = payload[0];
        if (myChart === undefined || !myChart.payload) {
            return null;
        }

        return (
            <div className="rechart-tooltip">
                <ul>
                    <li>
                        <Message msgId="profile.tabs.graphic.tooltip.name" msgParams={{ data: myChart.payload.name || '0', unit }} />
                    </li>
                    <li>
                        <Message msgId="profile.tabs.graphic.tooltip.altitude" msgParams={{ data: myChart.payload.altitude || '0', unit }} />
                    </li>
                </ul>
            </div>
        );
    };

    /**
     * Méthode permettant d'afficher le rendu du graphique ( Chargement + nom + graphique + Sélection d'export )
     */
    renderLineChart() {
        return (
            <div id="profile-linechart">
                {this.state.loading ? (
                    <div id="panel-loader">
                        <div className="_ms2_init_spinner _ms2_init_center">
                            <div className="_ms2_init_text _ms2_init_center" />
                        </div>
                    </div>
                ) : (
                    ''
                )}
                <div id="profile-side">
                    <h3>{this.state.profileName}</h3>
                    {!isEmpty(this.state.data) ? (
                        <AreaChart
                            onMouseMove={(e) => this.onMouseMove(e)}
                            ref="chart"
                            height={250}
                            width={550}
                            data={this.state.data}
                            margin={{
                                top: 5,
                                right: 0,
                                left: 0,
                                bottom: 5,
                            }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis unit={this.state.unit} dataKey="name" />
                            <YAxis unit={this.state.unit} domain={['dataMin - 10', 'dataMax + 10']} />
                            <Tooltip content={this.getProfileContentTooltip} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="altitude"
                                unit={this.state.unit}
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                                dot={false}
                                fill="#8884d8"
                            />
                        </AreaChart>
                    ) : null}
                    <div className="properties">
                        <p className="element">
                            <Message msgId="profile.tabs.graphic.unit" /> :
                            <b>
                                <Message msgId="profile.tabs.graphic.units.meter" />
                            </b>
                        </p>
                        <p className="element">
                            <Message msgId="profile.tabs.graphic.system" /> : <b>{getName(`EPSG:${this.state.defaultProjection}`)}</b>
                        </p>
                        <p className="element">
                            <Message msgId="profile.tabs.graphic.mnt" /> : <b>{this.state.mnt_selected}</b>
                        </p>
                    </div>
                </div>
                <div id="profile-export">
                    <label htmlFor="select-export">
                        <Message msgId="profile.tabs.graphic.export.title" />
                    </label>
                    <select className="form-control" id="select-export" defaultValue="" onChange={this.exportChoice}>
                        <option value="" disabled>
                            {LocaleUtils.getMessageById(this.context.messages, 'profile.tabs.graphic.export.choice')}
                        </option>
                        <option value="png">{LocaleUtils.getMessageById(this.context.messages, 'profile.tabs.graphic.export.image')}</option>
                        <option value="csv">{LocaleUtils.getMessageById(this.context.messages, 'profile.tabs.graphic.export.csv')}</option>
                        <option value="pdf">{LocaleUtils.getMessageById(this.context.messages, 'profile.tabs.graphic.export.pdf')}</option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }

    /**
     * Méthode permettant d'afficher le résumé issue du graphique
     */
    renderResume = () => {
        return (
            <p>
                <Message msgId="profile.tabs.summary.mnt" /> : <strong>{this.state.informations.referentiel}</strong>
                <br />
                <Message msgId="profile.tabs.summary.distance" /> : <strong>{this.state.informations.distance} m</strong>
                <br />
                <Message msgId="profile.tabs.summary.elevation.positive" /> : <strong>{this.state.informations.denivelepositif} m</strong>
                <br />
                <Message msgId="profile.tabs.summary.elevation.negative" /> : <strong>{this.state.informations.denivelenegatif} m</strong>
                <br />
                <Message msgId="profile.tabs.summary.points.numbers" />{' '}
                <strong>
                    {this.state.informations.processedpoints} <Message msgId="profile.tabs.summary.points.total" />
                </strong>
                <br />
            </p>
        );
    };

    /**
     * Effectue le zoom sur le profile généré à l'import
     * @param feature
     */
    zoomOnProfile = (feature) => {
        const size = this.props.map.size || { width: 1920, height: 800 };
        const newGeometry = new LineString(feature.geometry.coordinates);
        const bbox = newGeometry.getExtent();
        const zoom = MapUtils.getZoomForExtent(bbox, size, 1, 20, 400);
        try {
            const getCenter = MapUtils.getCenterForExtent(
                CoordinatesUtils.reprojectBbox(newGeometry.getExtent(), newGeometry.projection || 'EPSG:3857', 'EPSG:4326'),
                'EPSG:4326'
            );

            this.props.changeMapView(
                getCenter,
                zoom - 1,
                {
                    bounds: {
                        miny: bbox[1],
                        minx: bbox[0],
                        maxy: bbox[3],
                        maxx: bbox[2],
                    },
                    crs: newGeometry.projection || 'EPSG:3857',
                },
                size,
                'profile',
                this.props.map.projection,
                this.props.map.viewerOptions
            );
        } catch (e) {
            console.log("Erreur .zoomOnProfile", e);
            this.setState({
                loading: false,
                success: undefined,
                error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorLine'),
                data: [],
            });
        }
    };

    uploadShp = (event) => {
        const file = event.target.files[0];
        FileUtils.readZip(file).then((buffer) =>
            FileUtils.shpToGeoJSON(buffer).map((json) => {
                const feature = json.features[0];
                if (json.features.length > 1 || feature.geometry.type !== 'LineString') {
                    this.setState({
                        success: undefined,
                        error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorShape'),
                        data: [],
                    });
                    return;
                }
                if (feature.geometry.projection !== 'EPSG:3857') {
                    feature.geometry = CoordinatesUtils.reprojectGeoJson(feature.geometry, feature.geometry.projection || 'EPSG:2154', 'EPSG:3857');
                }

                this.zoomOnProfile(feature);
                this.props.changeGeometryProfile({
                    ...feature.geometry,
                    projection: 'EPSG:3857',
                    method: 'import-shp',
                    id: StringUtils.uniqid(),
                });
            })
        );
    };

    uploadDXF = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const parser = new DxfParser();
            const result = reader.result;
            let r = parser.parseSync(result);
            if (!Array.isArray(r.entities) || r.entities.length === 0) {
                this.setState({
                    success: undefined,
                    error: LocaleUtils.getMessageById(this.context.messages, 'profile.errorDXF'),
                    data: [],
                });
                return;
            }
            const entity = r.entities[0];

            const feature = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: entity.vertices.map((vertice) => [vertice.x, vertice.y]),
                    projection: this.state.importProjection,
                },
            };

            if (feature.geometry.projection !== 'EPSG:3857') {
                feature.geometry = CoordinatesUtils.reprojectGeoJson(feature.geometry, feature.geometry.projection || 'EPSG:2154', 'EPSG:3857');
            }

            this.zoomOnProfile(feature);
            this.props.changeGeometryProfile({
                ...feature.geometry,
                projection: 'EPSG:3857',
                method: 'import-dxf',
                id: StringUtils.uniqid(),
            });
        };
        reader.readAsText(file);
    };

    importProjection = (event) => {
        this.setState({ importProjection: event.target.value });
    };

    /**
     * Méthode permettant d'affichage les paramètres
     */
    renderSettings = () => {
        let projectionsOptions = [];
        for (let EPSG in ProjectionsUtils.list) {
            projectionsOptions.push(
                <option key={EPSG} value={EPSG}>
                    {ProjectionsUtils.list[EPSG]}
                </option>
            );
        }

        return (
            <div>
                <div className="row">
                    {/* Partie de gauche / Choix du MNT */}
                    <div className="col-md-6">
                        <div className="row">
                            <div className="col-md-12">
                                <p>
                                    <Message msgId="profile.tabs.settings.mnt" /> :
                                </p>
                                <select className="form-control" id="select-mnt" ref="mntSelected" defaultValue={this.state.mnt_selected}>
                                    {this.state.mnt_files.map((mnt, key) => (
                                        <option value={mnt} key={key}>
                                            {mnt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <p className="profile-input-label">
                                    <Message msgId="profile.tabs.settings.titleOf" />:{' '}
                                </p>
                                <input
                                    value={this.state.profileName}
                                    onChange={this.handleInput}
                                    name="profileName"
                                    className="form-control profile-input"
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <p className="profile-input-label">
                                    <Message msgId="profile.tabs.settings.steps" /> :{' '}
                                </p>
                                <input value={this.state.step} onChange={this.handleInput} name="step" className="form-control profile-input" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <button className="btn btn-default btn-valid_mnt" onClick={this.handleMnt}>
                                    <Message msgId="profile.tabs.settings.ok" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Partie de droite / Import de fichier */}
                    <div className="col-md-6">
                        <div className="row">
                            <div className="col-md-12">
                                <Alert className="alert alert-success">
                                    <Message msgId="profile.tabs.settings.imports.shp_explaination" />
                                </Alert>
                                <input
                                    className="form-control"
                                    type="file"
                                    name="uploadShape"
                                    id="uploadShape"
                                    style={{ display: 'none' }}
                                    onChange={(e) => this.uploadShp(e)}
                                    accept=".zip"
                                />
                                <label htmlFor="uploadShape" className={`btn btn-primary file-upload`}>
                                    <Message msgId="profile.tabs.settings.imports.shp" />
                                </label>
                                <hr />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <Alert className="alert alert-success">
                                    <Message msgId="profile.tabs.settings.imports.dxf_explaination" />
                                </Alert>
                                <div className="mb-2">
                                    <select className="form-control" onChange={this.importProjection}>
                                        <option value="" selected disabled>
                                            {LocaleUtils.getMessageById(this.context.messages, 'profile.tabs.settings.imports.projection')}
                                        </option>
                                        {projectionsOptions}
                                    </select>
                                </div>
                                <input
                                    type="file"
                                    className="form-control"
                                    name="uploadDXF"
                                    id="uploadDXF"
                                    style={{ display: 'none' }}
                                    onChange={this.uploadDXF}
                                    accept=".dxf"
                                    disabled={this.state.importProjection === undefined}
                                />
                                <label
                                    htmlFor="uploadDXF"
                                    className={`btn btn-primary file-upload ${this.state.importProjection === undefined && 'label-disabled'}`}>
                                    <Message msgId="profile.tabs.settings.imports.dxf" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Rendu principal
     */
    render() {
        if (this.props.show) {
            return (
                <Dialog id="mapstore-profile-panel" className="modal-dialog">
                    <div key="header" role="header" id="profile-header">
                        <TiChartAreaOutline color="#ffffff" style={{ width: '18px', marginRight: '14px' }} />
                        &nbsp; <Message msgId="profile.title" />
                        <button key="close" onClick={this.props.toggleControl} className="close">
                            {this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph} /> : <span>×</span>}
                        </button>
                    </div>
                    <div key="body" className="panel-body" role="body">
                        {this.state.error && (
                            <Alert bsStyle={'danger'}>
                                <span>{this.state.error}</span>
                            </Alert>
                        )}
                        {this.state.success && (
                            <Alert bsStyle={'success'}>
                                <span>{this.state.success}</span>
                            </Alert>
                        )}
                        <div id="profile-tabs">
                            {this.props.elements.includes('profile') && (
                                <div
                                    className={this.state.selectedElement === 'profile' ? 'profile-active' : undefined}
                                    onClick={() => this.setState({ selectedElement: 'profile', success: undefined, error: undefined })}>
                                    <Message msgId="profile.tabs.graphic.title" />
                                </div>
                            )}
                            {this.props.elements.includes('resume') && (
                                <div
                                    className={this.state.selectedElement === 'resume' ? 'profile-active' : undefined}
                                    onClick={() => this.setState({ selectedElement: 'resume', success: undefined, error: undefined })}>
                                    <Message msgId="profile.tabs.summary.title" />
                                </div>
                            )}
                            {this.props.elements.includes('settings') && (
                                <div
                                    className={this.state.selectedElement === 'settings' ? 'profile-active' : undefined}
                                    onClick={() => this.setState({ selectedElement: 'settings', success: undefined, error: undefined })}>
                                    <Message msgId="profile.tabs.settings.title" />
                                </div>
                            )}
                        </div>
                        {this.state.selectedElement === 'profile' ? <div id="profile-chart">{this.renderLineChart()}</div> : undefined}
                        {this.state.selectedElement === 'resume' ? <div id="profile-resume">{this.renderResume()}</div> : undefined}
                        {this.state.selectedElement === 'settings' ? <div id="profile-settings">{this.renderSettings()}</div> : undefined}
                    </div>
                </Dialog>
            );
        }
        return null;
    }
}

module.exports = Profile;
