const React = require('react');
const PropTypes = require('prop-types');
const Item = require('./Item').default;

class GeosignetList extends React.Component {
    static propTypes = {
        selectSignet: PropTypes.func,
        geosignets: PropTypes.array,
        currentSelected: PropTypes.object,
    };

    static defaultProps = {
        selectSignet: () => {},
        geosignets: [],
        currentSelected: {},
    };

    renderSignet(signet) {
        return <Item signet={signet} currentSelected={this.props.currentSelected} selectSignet={this.props.selectSignet} />;
    }

    renderList() {
        const list = this.props.geosignets.map((signet) => this.renderSignet(signet));
        return (
            <div id="listGeoSignets">
                <div className="toc-default-group">
                    <div className="toc-group-children">
                        <div className="">{list}</div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="text-center col-xs-12">
                        <div className="mapstore-filter form-group">
                            <div id="geosignet-box">{this.renderList()}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = GeosignetList;
