const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const url = require('url');

const Page = require('../../MapStore2/web/client/containers/Page');
const urlQuery = url.parse(window.location.href, true).query;

class WidgetViewer extends React.Component {
    static propTypes = {
        match: PropTypes.object,
        plugins: PropTypes.object,
    };

    render() {
        return <Page id="widgets" plugins={this.props.plugins} params={this.props.match.params} />;
    }
}

module.exports = connect((state) => ({
    mode: urlQuery.mobile || (state.browser && state.browser.mobile) ? 'mobile' : 'desktop',
}))(WidgetViewer);
