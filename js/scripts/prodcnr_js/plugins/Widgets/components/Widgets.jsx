const React = require('react');
const PropTypes = require('prop-types');
const { Button, Grid, Row, Col, FormGroup, ControlLabel, Glyphicon, Tooltip } = require('react-bootstrap');
const OverlayTrigger = require('../../../../MapStore2/web/client/components/misc/OverlayTrigger');

const Message = require('../../../../MapStore2/web/client/plugins/locale/Message');
const WidgetUtils = require('../../../utils/WidgetUtils');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const MapUtils = require('../../../../MapStore2/web/client/utils/MapUtils');

class Widgets extends React.Component {
    static propTypes = {
        addWidget: PropTypes.func,
        removeWidget: PropTypes.func,
        toggleControl: PropTypes.func,
        resetCurrentMap: PropTypes.func,
        selectedWidgets: PropTypes.array,
        currentUserWidgetList: PropTypes.array,
    };

    static defaultProps = {
        addWidget: () => {},
        removeWidget: () => {},
        toggleControl: () => {},
        resetCurrentMap: () => {},
        selectedWidgets: [],
        currentUserWidgetList: [],
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    /**
     * Modification de la configuration d'un widget
     * @param e
     */
    changePlugins = (e) => {
        this.toggleElement(e.target);
    };

    /**
     * Liste des widgets
     * @returns {Array}
     */
    getWidgets = () => {
        return this.reorder(WidgetUtils.filterEnabledWidget());
    };

    /**
     * Affichage par ordre alphabétique (title)
     */
    reorder = (data) => {
        return data.sort((a, b) => {
            let nameA = LocaleUtils.getMessageById(this.context.messages, a.title),
                nameB = LocaleUtils.getMessageById(this.context.messages, b.title);
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            return 0;
        });
    };

    /**
     * Met à jour la liste des plugins
     * @param input
     * @returns {*}
     */
    toggleElement = (input) => {
        const value = input.value;
        if (input.checked) {
            this.props.addWidget(value);
        } else {
            this.props.removeWidget(value);
        }
    };

    renderBody() {
        const widgets = this.getWidgets();
        const tooltip = (
            <Tooltip id="widgets-reset-tooltip">
                <Message msgId="customWidgets.resetTooltip" />
            </Tooltip>
        );

        return (
            <div className="widgets-list">
                <div className="widgets-save">
                    <div className="alert alert-info">
                        <Message msgId="customWidgets.think" />
                    </div>
                    {widgets.filter((w) => !this.props.currentUserWidgetList.includes(w.key)).length > 0 ? (
                        <div className="alert alert-info">
                            <Message msgId="customWidgets.thinkTwice" />
                        </div>
                    ) : null}
                </div>
                <div className="widgets-ul">
                    <ul>
                        {widgets.map((widget) => {
                            const checked = this.props.selectedWidgets.includes(widget.key);
                            const visible = this.props.currentUserWidgetList.includes(widget.key);
                            return (
                                <li key={widget.key}>
                                    <label
                                        htmlFor={`widget_${widget.key}`}
                                        style={{
                                            lineHeight: 'normal',
                                            width: '90%',
                                            fontStyle: visible ? 'normal' : 'italic',
                                            color: visible ? 'black' : 'grey',
                                        }}>
                                        <input
                                            style={{ verticalAlign: 'middle', width: '10%', margin: '0' }}
                                            type="checkbox"
                                            value={widget.key}
                                            id={`widget_${widget.key}`}
                                            checked={checked}
                                            onChange={this.changePlugins}
                                        />
                                        <Message msgId={widget.title} />
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="widgets-reset">
                    <OverlayTrigger overlay={tooltip} placement="top">
                        <Button bsStyle="primary" onClick={this.props.resetWidgets} tooltip={tooltip}>
                            <Message msgId="customWidgets.reset" />
                        </Button>
                    </OverlayTrigger>
                </div>
            </div>
        );
    }

    /**
     * Affichage de la Modal
     * @returns HTML
     */
    renderDialog() {
        return (
            <div id="widgets-panel">
                <div role="header" className="widgets-panel-header">
                    <span className="widgets-panel-title">
                        <Message msgId="widgets.title" />
                    </span>
                    <button onClick={this.props.toggleControl} className="widgets-panel-close close">
                        <Glyphicon glyph="1-close" />
                    </button>
                </div>
                {this.renderBody()}
            </div>
        );
    }

    render() {
        if (this.props.visible) {
            return this.renderDialog();
        }

        return null;
    }
}

module.exports = Widgets;
