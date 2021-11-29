const React = require('react');
const { Glyphicon, Alert } = require('react-bootstrap');
const PropTypes = require('prop-types');
const axios = require('axios');
const Spinner = require('react-spinkit');

const Dialog = require('../../../../MapStore2/web/client/components/misc/Dialog');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const CoordinatesUtils = require('../../../../MapStore2/web/client/utils/CoordinatesUtils');
const ConfigUtils = require('../../../../MapStore2/web/client/utils/ConfigUtils');

require('./style.css');

class ZOrtho extends React.Component {
    static propTypes = {
        geometry: PropTypes.object,
        show: PropTypes.bool,
        onClose: PropTypes.func,
        active: PropTypes.bool,
        disactivate: PropTypes.func,
    };

    static defaultProps = {
        geometry: {},
        show: false,
        active: false,
        onClose: () => {},
        disactivate: () => {},
    };

    state = {
        error: undefined,
        informations: {},
        lambert: [],
        loading: false,
    };

    /**
     * Gestion des variables de langues
     * @type {{messages: shim}}
     */
    static contextTypes = {
        messages: PropTypes.object,
    };

    /**
     * Permet de faire le calcul en IGN69
     * @param {Object} nextProps La nouvelle version des props
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.active && !nextProps.active) {
            this.props.disactivate();
        }
        if (nextProps.geometry !== this.props.geometry && nextProps.geometry !== undefined) {
            this.setState({ loading: true, error: undefined });
            let point = this.convertToLambert93(nextProps.geometry);
            if (point.length > 0) {
                axios
                    .get(ConfigUtils.getConfigProp('georchestraUrlRest') + '/cnr/calculateIgn69?X=' + point[0] + '&Y=' + point[1])
                    .then((response) => {
                        if (response.data.result === 'OK') {
                            if (response.data['Z_VALUE'].Z_ORTHO !== -9999) {
                                this.setState({ informations: response.data['Z_VALUE'], loading: false });
                            } else {
                                this.setState({ informations: {}, error: "Aucune donnée n'est disponible pour ces coordonnées", loading: false });
                            }
                        } else {
                            if (response.data.description) {
                                this.setState({ informations: {}, error: response.data.description, loading: false });
                            }
                        }
                    })
                    .catch(() =>
                        this.setState({
                            informations: {},
                            error: LocaleUtils.getMessageById(this.context.messages, 'zOrtho.errors.undefined'),
                            loading: false,
                        })
                    );
            } else {
                this.setState({ informations: {}, error: LocaleUtils.getMessageById(this.context.messages, 'zOrtho.errors.data'), loading: false });
            }
        }
    }

    /**
     * Fermeture de la modal
     * @return {void}
     */
    close = () => {
        this.props.toggleControl();
        this.props.disactivate();
    };

    /**
     * Méthode permettant de convertir les X,Y de la géométrie en Lambert93
     * @param {Object} geometry La géometrie du point dessiné
     * @return {Array} Le tableau contenant les coordonnées X,Y en Lambert93
     */
    convertToLambert93 = (geometry) => {
        let point = [];
        if (geometry && geometry.coordinates) {
            const source = geometry.projection;
            const dest = 'EPSG:2154';

            point = [geometry.coordinates[0], geometry.coordinates[1]];

            if (source !== dest) {
                let p = [parseFloat(geometry.coordinates[0]), parseFloat(geometry.coordinates[1])];
                p = CoordinatesUtils.reproject(p, source, dest);
                this.setState({ lambert: [p.x, p.y] });
                point = [p.x, p.y];
            } else {
                this.setState({ lambert: [geometry.coordinates[0], geometry.coordinates[1]] });
            }
        }
        return point;
    };

    /**
     * Méthode permettant de gérer l'affichage de l'icône de chargement
     */
    renderLoading() {
        return this.state.loading ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner-zortho" /> : null;
    }

    /**
     * Méthode permettant d'afficher les informations suite au traitement
     */
    renderInformations() {
        if (this.state.informations.hasOwnProperty('Z_IGN_69') && !this.state.loading) {
            return (
                <p>
                    <Message msgId="zOrtho.mnt" /> : <strong>{this.state.informations['FichierMnt']}</strong>
                    <br />
                    <Message msgId="zOrtho.labelX" /> : <strong>{this.state.informations['X']}</strong>
                    <br />
                    <Message msgId="zOrtho.labelY" /> : <strong>{this.state.informations['Y']}</strong>
                    <br />
                    <Message msgId="zOrtho.labelIGN" /> : <strong>{this.state.informations['Z_IGN_69']}</strong>
                    <br />
                    <Message msgId="zOrtho.labelZOrtho" /> <strong>{this.state.informations['Z_ORTHO']}</strong>
                    <br />
                </p>
            );
        }
        return null;
    }

    render() {
        if (this.props.show) {
            return (
                <Dialog id="mapstore-zortho-panel" className="modal-dialog" style={{ zIndex: 1000000, backgroundColor: 'white' }}>
                    <div key="header" role="header" id="zortho-header">
                        <Glyphicon glyph="retweet" />
                        &nbsp; <Message msgId="zOrtho.title" />
                        <button key="close" onClick={this.close} className="close">
                            <Glyphicon glyph={'1-close'} />
                        </button>
                    </div>
                    <div key="body" className="panel-body" role="body">
                        {this.renderLoading()}
                        {this.state.error && (
                            <Alert bsStyle={'danger'}>
                                <span>{this.state.error}</span>
                            </Alert>
                        )}
                        {this.renderInformations()}
                    </div>
                </Dialog>
            );
        }
        return null;
    }
}

module.exports = ZOrtho;
