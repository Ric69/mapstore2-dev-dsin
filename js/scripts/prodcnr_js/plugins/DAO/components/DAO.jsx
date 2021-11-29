const React = require('react');
const PropTypes = require('prop-types');
const { Glyphicon } = require('react-bootstrap');
const axios = require('axios');

const Message = require('@mapstore/components/I18N/Message');
const ConfigUtils = require('@mapstore/utils/ConfigUtils');
const Config = require('../config/config.json');

/**
 * @see MapStore2/web/client/components/data/identify/viewers/ViewerPage.jsx :: renderPage()
 */
class DAO extends React.Component {
    static propTypes = {
        feature: PropTypes.object,
        layer: PropTypes.string,
    };

    static defaultProps = {
        feature: {},
        layer: '',
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    state = {
        active: false,
        error: undefined,
        plan: undefined,
    };

    componentDidMount() {
        if (this.props.layer && this.props.feature) {
            if (Config.layers.includes(this.props.layer)) {
                if (this.props.feature && this.props.feature.properties && this.props.feature.properties.PLAN) {
                    this.setState({ active: true, plan: this.props.feature.properties.PLAN, error: undefined });
                } else {
                    this.setState({ active: false, plan: undefined, error: undefined });
                }
            } else {
                this.setState({ active: false, plan: undefined, error: undefined });
            }
        } else {
            this.setState({ active: false, plan: undefined, error: undefined });
        }
    }

    downloadAutoCad = () => {
        const autocadUrl = ConfigUtils.getConfigProp('georchestraUrlRest') + '/cnr/autocadDownload';
        axios
            .get(autocadUrl + '?plan=' + this.state.plan)
            .then((response) => {
                if (response.data.result === 'KO' && response.data.description) {
                    this.setState({ error: response.data.description });
                } else {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', this.state.plan + '.dwg');
                    document.body.appendChild(link);
                    link.click();
                }
            })
            .catch((e) => {
                console.log(e);
            });
    };

    renderError() {
        if (this.state.error) {
            return <div className="alert alert-danger mt-1">{this.state.error}</div>;
        }

        return null;
    }

    render() {
        return this.state.active ? (
            <>
                <button className="btn btn-primary btn-download-dao" onClick={this.downloadAutoCad}>
                    <Glyphicon glyph="download" /> <Message msgId="dao.download" />
                </button>
                {this.renderError()}
            </>
        ) : null;
    }
}

module.exports = DAO;
