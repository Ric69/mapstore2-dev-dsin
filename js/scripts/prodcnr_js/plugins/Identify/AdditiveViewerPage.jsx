const React = require('react');
const { Grid, Row } = require('react-bootstrap');

const LidarComponent = require('../Lidar/components/Lidar');
const DAOComponent = require('../DAO/components/DAO');

class AdditiveViewerPage extends React.Component {
    render() {
        if (this.props.widgets.indexOf('Lidar') === -1 && this.props.widgets.indexOf('Dao') === -1) {
            return null;
        }

        return (
            <Grid fluid role="body">
                <Row>
                    {this.props.widgets.indexOf('Lidar') > 0 ? (
                        <LidarComponent info={this.props.lidar} query={this.props.query} feature={this.props.feature} />
                    ) : null}
                    {this.props.widgets.indexOf('Dao') > 0 ? <DAOComponent layer={this.props.layer.title} feature={this.props.feature} /> : null}
                </Row>
            </Grid>
        );
    }
}

module.exports = AdditiveViewerPage;
