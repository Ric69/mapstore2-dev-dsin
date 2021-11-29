const React = require('react');
const PropTypes = require('prop-types');
const { SimpleSelect } = require('react-selectize');
const { partitionString } = require('prelude-extension');

const LocaleUtils = require('../../../../MapStore2/web/client/utils/LocaleUtils');

class WidgetSelect extends React.Component {
    static propTypes = {
        placeholder: PropTypes.string,
        list: PropTypes.array,
        selectedValue: PropTypes.object,
        getValueFromElement: PropTypes.func,
        getNameFromElement: PropTypes.func,
        onValueChange: PropTypes.func,
    };

    static defaultProps = {
        placeholder: '',
        list: [],
        selectedValue: null,
        getValueFromElement: (elem) => elem.id,
        getNameFromElement: (elem) => elem.name,
        onValueChange: () => {},
    };

    state = {
        search: '',
    };

    static contextTypes = {
        messages: PropTypes.object,
    };

    render() {
        const self = this;

        return (
            <SimpleSelect
                placeholder={LocaleUtils.getMessageById(this.context.messages, this.props.placeholder)}
                // we use state for search, so we can access it inside the options map function below
                search={this.state.search}
                onSearchChange={(search) => {
                    self.setState({ search: search });
                }}
                options={this.props.list.map((elem) => ({
                    label: this.props.getNameFromElement(elem),
                    value: this.props.getValueFromElement(elem),
                    labelPartitions: partitionString(this.props.getNameFromElement(elem), self.state.search),
                }))}
                // we add the search to the uid property of each option
                // to re-render it whenever the search changes
                // uid :: (Equatable e) => Item -> e
                uid={(item) => {
                    return item.label + self.state.search;
                }}
                // here we use the HighlightedText component to render the result of partition-string
                // render-option :: Item -> ReactElement
                renderOption={(item) => {
                    return <div className="simple-option">{item.label}</div>;
                }}
                value={this.props.list
                    .filter((elem) => this.props.getValueFromElement(elem) === this.props.selectedValue)
                    .map((elem) => ({ label: this.props.getNameFromElement(elem), value: this.props.getValueFromElement(elem) }))
                    .pop()}
                onValueChange={this.props.onValueChange}
            />
        );
    }
}

module.exports = WidgetSelect;
