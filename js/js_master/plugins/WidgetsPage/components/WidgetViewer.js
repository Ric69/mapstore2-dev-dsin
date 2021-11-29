const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const url = require('url');

const ConfigUtils = require('../../../../MapStore2/web/client/utils/ConfigUtils');
const Page = require('../../../../MapStore2/web/client/containers/Page');

const urlQuery = url.parse(window.location.href, true).query;

class WidgetViewer extends React.Component {
    render() {
        let plugins = ConfigUtils.getConfigProp('plugins') || {};
        let pagePlugins = {
            desktop: plugins.widgets || [],
            mobile: plugins.widgets || [],
        };

        return (
            <Page
                id="maps"
                pagePluginsConfig={pagePlugins}
                pluginsConfig={pagePlugins}
                plugins={this.props.plugins}
                params={this.props.match.params}
            />
        );
    }
}

module.exports = connect((state) => ({
    mode: urlQuery.mobile || (state.browser && state.browser.mobile) ? 'mobile' : 'desktop',
}))(WidgetViewer);
