const React = require('react');
const PropTypes = require('prop-types');
const { Table, Row, Col, Button, Glyphicon, Tooltip } = require('react-bootstrap');

const TButton = require('@mapstore/components/data/featuregrid/toolbars/TButton');
const OverlayTrigger = require('@mapstore/components/misc/OverlayTrigger');
const Message = require('@mapstore/components/I18N/Message');
const FilterField = require('@mapstore/components/data/query/FilterField');
const ComboField = require('@mapstore/components/data/query/ComboField');
const DateField = require('@mapstore/components/data/query/DateField');
const NumberField = require('@mapstore/components/data/query/NumberField');
const TextField = require('@mapstore/components/data/query/TextField');

class RuleSelector extends React.Component {
    static propTypes = {
        availablesElements: PropTypes.arrayOf(PropTypes.object),
        selectedElements: PropTypes.arrayOf(PropTypes.object),
        titleSelected: PropTypes.string,
        noSelected: PropTypes.string,
        titleAvailable: PropTypes.string,
        noResult: PropTypes.string,
        selectPlaceholder: PropTypes.string,
        disabled: PropTypes.bool,
        geometryFilterButton: PropTypes.node,

        updateElements: PropTypes.func,
    };

    static defaultProps = {
        availablesElements: [],
        selectedElements: [],
        titleSelected: 'Utilisateurs notifiés',
        noSelected: 'Aucun Utilisateurs',
        titleAvailable: 'Ajouter un Utilisateur',
        noResult: 'aucun résultat trouvé',
        selectPlaceholder: '',
        disabled: false,

        onRemoveElement: () => [],
        onAddElement: () => [],
    };

    renderfilterRows = () => {
        if (this.props.selectedElements.length === 0) {
            return (
                <tr>
                    <td colSpan="3">
                        <Message msgId="notify.filters.noFilters" />
                    </td>
                </tr>
            );
        }
        return this.props.selectedElements.map((element, index) => {
            return (
                <tr key={index} className={index / 2 === 0 ? 'even' : 'odd'}>
                    <td colSpan="3">{this.renderFilterField({ rowId: index, ...element })}</td>
                </tr>
            );
        });
    };

    onAddElement = () => {
        if (!this.props.disabled) return this.props.updateElements(this.props.selectedElements.concat({}));
    };

    onRemoveFilterField = (id) => {
        return this.props.updateElements(this.props.selectedElements.filter((elem, index) => index !== id));
    };

    onUpdateFilterField = (id, fieldName, value, type) => {
        let copyElements = this.props.selectedElements.map((e) => ({ ...e }));
        switch (fieldName) {
            case 'attribute':
                copyElements[id].type = type;
                copyElements[id].attribute = value;
                break;
            case 'value':
                if (type === 'date' || type === 'date-time') {
                    copyElements[id].value = value.startDate.toISOString();
                    break;
                }
            default:
                copyElements[id][fieldName] = value;
        }
        // let filterField = copyElements.filter((elem,index) => index === id).pop();
        return this.props.updateElements(copyElements);
    };

    formatFilteredField = (filterField) => {
        if (
            filterField.value === undefined ||
            filterField.type === undefined ||
            (filterField.type !== 'date' && filterField.type !== 'date-time') ||
            typeof filterField.value !== 'string'
        ) {
            return filterField;
        } else {
            if (filterField.value === 'Invalid Date') {
                return { ...filterField, value: undefined };
            } else {
                return { ...filterField, value: { startDate: new Date(filterField.value) } };
            }
        }
    };

    renderFilterField = (filterField) => {
        const deleteButton = (
            <OverlayTrigger
                placement="top"
                overlay={
                    <Tooltip id={filterField.rowId + 'tooltip'}>
                        <strong>
                            <Message msgId="notify.filters.delete" />
                        </strong>
                    </Tooltip>
                }>
                <Button id="remove-filter-field" className="filter-buttons no-border" onClick={() => this.onRemoveFilterField(filterField.rowId)}>
                    <Glyphicon glyph="1-close" />
                </Button>
            </OverlayTrigger>
        );

        return (
            <div key={filterField.rowId}>
                <Row className="filter-field-row filter-field-row">
                    <Col xs={12}>
                        <FilterField
                            deleteButton={deleteButton}
                            attributes={this.props.availablesElements
                                .filter((attribute) => ['date', 'date-time', 'string', 'number', 'boolean'].includes(attribute.type))
                                .map((attribute) => ({ attribute: attribute.name, type: attribute.type, label: attribute.name }))}
                            filterField={this.formatFilteredField(filterField)}
                            operatorOptions={['=', '<', '>', '!=']}
                            onUpdateField={this.onUpdateFilterField}>
                            <DateField attType="date" operator={filterField.operator} />
                            <DateField timeEnabled attType="date-time" dateFormat="lll" operator={filterField.operator} />
                            <NumberField operator={filterField.operator} attType="number" />
                            <TextField operator={filterField.operator} attType="string" />
                            <ComboField fieldOptions={['true', 'false']} attType="boolean" comboFilter={'contains'} />
                        </FilterField>
                    </Col>
                </Row>
            </div>
        );
    };

    render() {
        return (
            <div>
                <Table className="permissions-table" stripped condensed hover>
                    <thead>
                        <tr>
                            <th colSpan="2">
                                <Message msgId="notify.filters.title" />
                            </th>
                            <th style={{ textAlign: 'right' }}>
                                {this.props.geometryFilterButton}
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        <Tooltip id="buttonAddTooltip">
                                            <strong>
                                                <Message msgId="notify.filters.add" />
                                            </strong>
                                        </Tooltip>
                                    }>
                                    <TButton
                                        id="buttonAdd"
                                        active={this.props.disabled}
                                        disabled={this.props.disabled}
                                        className="square-button-md"
                                        bsSize="small"
                                        visible
                                        onClick={this.onAddElement}
                                        glyph="plus"
                                    />
                                </OverlayTrigger>
                            </th>
                        </tr>
                    </thead>
                    <tbody>{this.renderfilterRows()}</tbody>
                </Table>
            </div>
        );
    }
}

module.exports = RuleSelector;
