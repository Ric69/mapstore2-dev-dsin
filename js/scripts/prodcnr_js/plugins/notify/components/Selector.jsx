const React = require('react');
const PropTypes = require('prop-types');
const Select = require('react-select');
const { Table, Button, Glyphicon } = require('react-bootstrap');

const TButton = require('@mapstore/components/data/featuregrid/toolbars/TButton');
const Message = require('@mapstore/components/I18N/Message');
const LocaleUtils = require('@mapstore/utils/LocaleUtils');

class Selector extends React.Component {
    static propTypes = {
        availablesElements: PropTypes.arrayOf(PropTypes.object),
        selectedElements: PropTypes.arrayOf(PropTypes.object),
        titleSelected: PropTypes.string,
        noSelected: PropTypes.string,
        titleAvailable: PropTypes.string,
        noResult: PropTypes.string,
        selectPlaceholder: PropTypes.string,
        disabled: PropTypes.bool,
        onRemoveElement: PropTypes.func,
        onAddElement: PropTypes.func,
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    static defaultProps = {
        availablesElements: [],
        selectedElements: [],
        titleSelected: 'selector.titleSelected',
        noSelected: 'selector.noSelected',
        titleAvailable: 'selector.titleAvailable',
        noResult: 'selector.noResult',
        selectPlaceholder: '',
        disabled: false,
        onRemoveElement: () => [],
        onAddElement: () => [],
    };

    state = {
        selectedOption: null,
    };

    renderPermissionRows = () => {
        if (this.props.selectedElements.length === 0) {
            return (
                <tr>
                    <td colSpan="3">
                        <Message msgId={this.props.noSelected} />
                    </td>
                </tr>
            );
        }
        return this.props.selectedElements.map((element, index) => {
            return (
                <tr key={index} className={index / 2 === 0 ? 'even' : 'odd'}>
                    <td>{element.name || element.title}</td>
                    <td style={{ width: '50px' }}>
                        <Button
                            key={'deleteButton' + index}
                            ref="deleteButton"
                            bsStyle="danger"
                            disabled={this.props.disabled}
                            onClick={this.props.onRemoveElement.bind(this, element)}>
                            <Glyphicon glyph="1-close" />
                        </Button>
                    </td>
                </tr>
            );
        });
    };

    getSelectableGroups = () => {
        return (
            this.props.availablesElements &&
            this.props.availablesElements
                .filter((element) => this.props.selectedElements.findIndex((selected) => selected.id === element.id) === -1)
                .map((element) => ({ label: element.name || element.title, value: element.id }))
        );
    };

    onElementChoose = (selectedOption) => {
        this.setState({
            selectedOption,
        });
    };

    onAddElement = () => {
        let selectedElement = this.props.availablesElements.find((elem) => elem.id === this.state.selectedOption.value);
        this.setState({
            selectedOption: null,
        });
        return this.props.onAddElement(selectedElement);
    };

    render() {
        return (
            <div>
                <Table className="permissions-table" stripped condensed hover>
                    <thead>
                        <tr>
                            <th colSpan="2">
                                <Message msgId={this.props.titleSelected} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderPermissionRows()}
                        <tr>
                            <th colSpan="2">
                                <Message msgId={this.props.titleAvailable} />
                            </th>
                        </tr>
                        <tr key="addRowKey">
                            <td>
                                <Select
                                    disabled={this.props.disabled}
                                    noResultsText={LocaleUtils.getMessageById(this.context.messages, this.props.noResult)}
                                    ref="newElement"
                                    isLoading={!this.getSelectableGroups()}
                                    clearable={false}
                                    placeholder={LocaleUtils.getMessageById(this.context.messages, this.props.selectPlaceholder)}
                                    options={this.getSelectableGroups()}
                                    value={this.state.selectedOption}
                                    onChange={this.onElementChoose}
                                />
                            </td>
                            <td style={{ width: '50px' }}>
                                <TButton
                                    id="buttonAdd"
                                    active={this.props.disabled || !(this.state.selectedOption && this.state.selectedOption.value)}
                                    disabled={this.props.disabled || !(this.state.selectedOption && this.state.selectedOption.value)}
                                    bsSize="small"
                                    visible
                                    className="square-button-md"
                                    onClick={this.onAddElement}
                                    glyph="plus"
                                />
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        );
    }
}

module.exports = Selector;
