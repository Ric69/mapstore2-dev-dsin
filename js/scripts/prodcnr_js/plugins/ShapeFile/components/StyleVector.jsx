/**
 * @author Capgemini
 */

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { isNil, isEmpty } = require('lodash');

const { StylePolygon, StylePolyline, StylePoint } = require('./index');
const { ControlLabel } = require('react-bootstrap');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');

const { editStyleParameter } = require('../../../../MapStore2/web/client/actions/style');

require('react-widgets/lib/less/react-widgets.less');

class StyleVector extends React.Component {
    static propTypes = {
        element: PropTypes.object,
        formats: PropTypes.array,
        settings: PropTypes.object,
        onChange: PropTypes.func,
        // CALLBACKS
        onEditStyleParameter: PropTypes.func,
    };

    static defaultProps = {
        onChange: () => {},
        onEditStyleParameter: () => {},
    };

    state = {
        isLoading: true,
    };

    componentDidMount() {
        if (this.props.element && !isNil(this.props.element.style)) {
            // Récupération du style s'il existe déjà
            this.setState({ ...this.props.element.style });
        }
        this.setState({
            isLoading: false,
        });
    }

    getGeometryType = (geometry) => {
        if (geometry && geometry.type === 'GeometryCollection') {
            return geometry.geometries.reduce((previous, g) => {
                if (g && g.type === previous) {
                    return previous;
                }
                return g.type;
            }, null);
        }
        if (geometry) {
            switch (geometry.type) {
                case 'Polygon':
                case 'MultiPolygon': {
                    return 'Polygon';
                }
                case 'MultiLineString':
                case 'LineString': {
                    return 'LineString';
                }
                case 'Point':
                case 'MultiPoint': {
                    return 'Point';
                }
                default: {
                    return null;
                }
            }
        }
        return null;
    };

    getGeomType = (layer) => {
        if ((layer && layer.features && layer.features[0].geometry) || (layer.geoJson && !isEmpty(layer.geoJson) && layer.geoJson.features)) {
            return (layer.features || layer.geoJson.features).reduce((previous, f) => {
                const currentType = this.getGeometryType(f.geometry);
                if (previous) {
                    return currentType === previous ? previous : 'GeometryCollection';
                }
                return currentType;
            }, null);
        } else if (layer.geoJson && !isEmpty(layer.geoJson)) {
            if (layer.geoJson.geometry) {
                return layer.geoJson.geometry.type;
            }
        }
    };

    renderStyle = () => {
        const stylers = {
            Polygon: <StylePolygon />,
            MultiPolygon: <StylePolygon />,
            GeometryCollection: <StylePolygon />,
            LineString: <StylePolyline />,
            MultiLineString: <StylePolyline />,
            MultiPoint: <StylePoint />,
            Point: <StylePoint />,
        };

        return stylers[this.getGeomType(this.props.element)];
    };

    render() {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', height: '90%' }}>
                <div style={{ margin: 'auto' }}>
                    <div style={{ textAlign: 'center' }}>
                        {' '}
                        <ControlLabel>
                            <Message msgId="layerProperties.shapeFileStyle" />
                        </ControlLabel>
                    </div>
                    {this.renderStyle()}
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = {
    onEditStyleParameter: editStyleParameter,
};

module.exports = connect(
    null,
    mapDispatchToProps
)(StyleVector);
