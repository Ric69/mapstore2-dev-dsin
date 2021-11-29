const React = require('react');
const PropTypes = require('prop-types');
const { Grid, Row, Col, Tooltip } = require('react-bootstrap');

const OverlayTrigger = require('../../../../MapStore2/web/client/components/misc/OverlayTrigger');
const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');
const Message = require('../../../../MapStore2/web/client/components/I18N/Message');
const WidgetSelect = require('./Select');

class WidgetsPage extends React.Component {
    state = {
        // Id de la donnée geostore avec l'ensemble des custom widgets
        id: 0,
        // Liste des widgets filtré par groupe et par user
        filtered: {},
        // Liste des widgets sélectionné
        selected: [],
        // Liste des widgets activables (localConfig)
        widgets: [],
        users: [],
        groups: [],
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    static propTypes = {
        visible: PropTypes.bool,
        initAccessRules: PropTypes.func,
        setListUsers: PropTypes.func,
        setListGroups: PropTypes.func,
        error: PropTypes.func,
        setWidget: PropTypes.func,
        widgetsSelector: PropTypes.array,
        listGroups: PropTypes.array,
        listUsers: PropTypes.array,
        selectedGroup: PropTypes.number,
        selectedUser: PropTypes.object,
        setCurrentGroup: PropTypes.func,
        setCurrentUser: PropTypes.func,
        saveRules: PropTypes.func,
    };

    static defaultProps = {
        visible: false,
        initAccessRules: () => {},
        setListUsers: () => {},
        setListGroups: () => {},
        error: () => {},
        setWidget: () => {},
        widgetsSelector: null,
        listGroups: [],
        listUsers: [],
        selectedGroup: 1,
        selectedUser: null,
        setCurrentGroup: () => {},
        setCurrentUser: () => {},
        saveRules: () => {},
    };
    componentWillMount() {
        if (this.props.visible) {
            this.props.initAccessRules();
            this.props.setListUsers();
            this.props.setListGroups();
        } else {
            this.props.error({
                title: 'customWidgets.noAccess.title',
                message: 'customWidgets.noAccess.message',
            });
            this.context.router.history.push('/');
        }
    } /*
    add = ({ mode = 'users', id, value }) => {
        const filtered = [...this.state.filtered[mode][id], value];
        const data = this.state.filtered[mode];
        data[id] = filtered;

        let toUpdate = {};
        toUpdate[mode] = data;

        this.setState({
            selected: filtered,
            filtered: assign({}, this.state.filtered, { toUpdate }),
        });
    };*/
    /**
     * Modification de la configuration d'un widget
     * @param e
     */

    /**
     * Ajoute des widgets par groupe/user
     * @param mode
     * @param id
     * @param value
     */ changePlugins = (e) => {
        const input = e.target;
        const value = input.value;
        this.props.setWidget(value, input.checked);
    };

    /**
     * Affichage par ordre alphabétique (title)
     * @param data
     * @returns {*}
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

    renderWidgets() {
        return (
            <Row className="widgets">
                {!this.props.widgetsSelector ? (
                    <div id="panel-loader">
                        <div className="_ms2_init_spinner _ms2_init_center">
                            <div className="_ms2_init_text _ms2_init_center" />
                        </div>
                    </div>
                ) : (
                    this.reorder(this.props.widgetsSelector).map((widget) => {
                        let checkbox = (
                            <label htmlFor={`widget_${widget.key}`} style={{ lineHeight: 'normal', width: '90%' }} onChange={this.changePlugins}>
                                <input
                                    style={{ verticalAlign: 'middle', width: '10%', margin: '0' }}
                                    type="checkbox"
                                    value={widget.key}
                                    id={`widget_${widget.key}`}
                                    checked={widget.selected}
                                    disabled={!widget.enabled}
                                />
                                <Message msgId={widget.title} />
                            </label>
                        );
                        if (widget.tooltip)
                            return (
                                <Col key={widget.key} className="widget-cell" md={3}>
                                    <OverlayTrigger overlay={<Tooltip>{widget.tooltip}</Tooltip>} placement="bottom">
                                        {checkbox}
                                    </OverlayTrigger>
                                </Col>
                            );
                        else
                            return (
                                <Col key={widget.key} className="widget-cell" md={3}>
                                    {checkbox}
                                </Col>
                            );
                    })
                )}
            </Row>
        );
    }

    renderSelects() {
        let selectGroup = React.createElement(WidgetSelect, {
            placeholder: 'customWidgets.groups.default',
            list: this.props.listGroups,
            selectedValue: this.props.selectedGroup,
            onValueChange: (value) => (!value ? this.props.setCurrentGroup(1) : this.props.setCurrentGroup(value.value)),
        });
        let selectUser = React.createElement(WidgetSelect, {
            placeholder: 'customWidgets.users.default',
            list: this.props.listUsers,
            selectedValue: this.props.selectedUser,
            getValueFromElement: (elem) => elem,
            onValueChange: (value) => (!value ? this.props.setCurrentGroup(1) : this.props.setCurrentUser(value.value)),
        });
        /*
        let selectGroup =React.createElement(SimpleSelect, {
            placeholder: LocaleUtils.getMessageById(this.context.messages, 'customWidgets.groups.default'),
            options: this.props.listGroups.map((group) => ({ label: group.name, value: group.id })),
            value: this.props.listGroups.filter(g => g.id === this.props.selectedGroup).map((group) => ({ label: group.name, value: group.id })).pop(),
            onValueChange:(value) => !value ? this.props.setCurrentGroup(1) :this.props.setCurrentGroup(value.value)
        });
        let selectUser = React.createElement(SimpleSelect, {
            placeholder: LocaleUtils.getMessageById(this.context.messages, 'customWidgets.users.default'),
            options: this.props.listUsers.map((user) => ({ label: user.name, value: user })),
            value: this.props.listUsers.filter(u => this.props.selectedUser && u.id === this.props.selectedUser.id).map((user) => ({ label: user.name, value: user.id })).pop(),
            onValueChange:(value) =>  !value ? this.props.setCurrentGroup(1) :this.props.setCurrentUser(value.value)
        });*/
        return this.props.listUsers && this.props.listGroups ? (
            <Row className="selects">
                <Col lg={4}>&nbsp;</Col>
                <Col lg={2} xs={12}>
                    {selectGroup}
                </Col>
                <Col lg={2} xs={12}>
                    {selectUser}
                </Col>
                <Col lg={4}>&nbsp;</Col>
            </Row>
        ) : (
            ''
        );
    }

    render() {
        let tooltip = (
            <Tooltip>
                <Message msgId="historyback.title" />
            </Tooltip>
        );

        return (
            <Grid id="widgets-page" fluid={true}>
                <Row>
                    <Col lg={12}>
                        <h1>
                            <Message msgId="customWidgets.title" />
                        </h1>
                    </Col>
                </Row>
                {this.renderSelects()}
                {this.renderWidgets()}
                <Row>
                    <Col xs={12}>
                        <button type="button" className="btn btn-primary" onClick={this.props.saveRules}>
                            <Message msgId="customWidgets.save" />
                        </button>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

module.exports = WidgetsPage;
