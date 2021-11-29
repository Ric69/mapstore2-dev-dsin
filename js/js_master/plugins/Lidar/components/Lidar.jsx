const React = require('react');
const PropTypes = require('prop-types');
const { Alert, FormGroup } = require('react-bootstrap');
const assign = require('object-assign');
const axios = require('axios');
const urlUtil = require('url');

const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const ConfigUtils = require('../../../../MapStore2/web/client/utils/ConfigUtils');
const lidarConfig = require('../lidar.json');

/**
 * @see MapStore2/web/client/components/data/identify/viewers/ViewerPage.jsx :: renderPage()
 */
class Lidar extends React.Component {
    static propTypes = {
        info: PropTypes.object,
        feature: PropTypes.object,
        layer: PropTypes.string,
        rasterTypes: PropTypes.object,
    };

    static defaultProps = {
        info: {},
        feature: {},
        layer: '',
        rasterTypes: {
            TIF: {
                label: 'Format .tif',
            },
            ECW: {
                label: 'Format .ecw',
            },
            LAS: {
                label: 'Format .las',
            },
            ASC: {
                label: 'Format .asc',
            },
        },
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    state = {
        active: false,
        config: {},
        error: '',
        properties: {},
        query: '',
        selected: '',
    };

    componentDidMount() {
        const config = lidarConfig;
        const query = this.props.query;
        const feature = this.props.feature;

        this.setState({
            active: !!config.layers[query],
            config: config,
            properties: feature.properties || {},
            query: query,
            selected: config.layers[query] && config.layers[query].lidar ? config.layers[query].lidar : undefined,
        });
    }

    componentWillReceiveProps(newProps) {
        let query = this.state.query;

        if (newProps.query !== this.state.query) {
            query = newProps.query;
            this.setState({ query });
        }

        if (newProps.feature && newProps.feature.properties && newProps.feature.properties.NOM !== this.state.properties.NOM) {
            this.setState({ properties: newProps.feature.properties });
        }
    }

    /**
     * Liste l'ensemble des type de raster disponible
     *
     * @returns {*[]}
     */
    getRasters = () => {
        return Object.keys(this.props.rasterTypes).map((raster) => {
            return assign({}, this.props.rasterTypes[raster], {
                label: this.props.rasterTypes[raster].label,
                value: raster,
            });
        });
    };

    /**
     * Téléchargement des tuiles au format demandé
     *
     * @param response
     */
    downloadRaster = (response) => {
        const value = response.target.value;
        if (this.state.active && response.target.value) {
            if (this.state.selected && this.state.properties.NOM && this.state.properties.ID_ASSEMBL) {
                let url = ConfigUtils.getConfigProp('georchestraUrlRest') + '/cnr/rasterDownload';
                const params = {
                    rasterType: value,
                    layerName: this.state.selected,
                    baseName: this.state.properties.NOM,
                    idAssemblage: this.state.properties.ID_ASSEMBL,
                };

                url += urlUtil.format({ query: params });

                axios
                    .get(url, {
                        responseType: 'blob',
                    })
                    .then((response) => {
                        const result = response.data;

                        if (result.type !== 'application/octet-stream') {
                            this.setState({ error: LocaleUtils.getMessageById(this.context.messages, 'lidar.errorRaster') });
                        } else {
                            const url = window.URL.createObjectURL(new Blob([result]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', params.baseName + '.zip');
                            document.body.appendChild(link);
                            link.click();
                        }
                    })
                    .catch(() => {
                        this.setState({ error: LocaleUtils.getMessageById(this.context.messages, 'lidar.error') });
                    });
            } else {
                this.setState({ error: LocaleUtils.getMessageById(this.context.messages, 'lidar.errorProperty') });
            }
        } else {
            this.setState({ error: '' });
        }
    };

    render() {
        if (!this.state.active) {
            return null;
        }

        return (
            <div id="lidar">
                <h3>{LocaleUtils.getMessageById(this.context.messages, 'lidar.title')}</h3>
                {this.state.error ? (
                    <Alert bsStyle={'danger'}>
                        <p>{this.state.error}</p>
                    </Alert>
                ) : (
                    ''
                )}
                <FormGroup className="lidar-form">
                    <select onChange={this.downloadRaster} className="form-control" name="lidar-format" id="lidar-format">
                        <option value="">{LocaleUtils.getMessageById(this.context.messages, 'lidar.servicePlaceholder')}</option>
                        {this.getRasters().map((raster) => {
                            return (
                                <option key={raster.value} value={raster.value}>
                                    {raster.label}
                                </option>
                            );
                        })}
                    </select>
                </FormGroup>
            </div>
        );
    }
}

module.exports = Lidar;
