const React = require('react');
const PropTypes = require('prop-types');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const { Glyphicon, Tooltip, Button } = require('react-bootstrap');

class BarButton extends React.Component {
    static propTypes = {
        icon: PropTypes.node,
        action: PropTypes.func,
        visible: PropTypes.bool,
        tooltip: PropTypes.string,
    };

    static defaultProps = {
        visible: true,
        icon: <Glyphicon glyph="th" />,
        tooltip: '',
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object,
    };

    onClick = () => {
        if (this.props.active === false || this.props.active === undefined) {
            this.props.action({ context: this.context });
        }
    };

    render() {
        let tooltip = (
            <Tooltip>
                <Message msgId={this.props.tooltip} />
            </Tooltip>
        );
        let active = {
            bsStyle: 'primary',
        };
        if (this.props.active) {
            active['bsStyle'] = 'success';
        }

        if (this.props.visible) {
            return (
                <Button {...this.props} className="square-button" {...active} onClick={this.onClick} tooltip={tooltip}>
                    {this.props.icon}
                </Button>
            );
        }
        return null;
    }
}

module.exports = BarButton;
