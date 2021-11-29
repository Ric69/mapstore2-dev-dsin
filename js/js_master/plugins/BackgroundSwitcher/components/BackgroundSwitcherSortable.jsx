/**
 * @author CapGemini
 */
const React = require('react');
const createReactClass = require('create-react-class');
const SortableMixin = require('react-sortable-items/SortableItemMixin');

/**
 * Un élément "Sortable" du BackgroundSwitcher
 */
const BackgroundSwitcherSortable = createReactClass({
    displayName: 'BackgroundSwitcherSortable',

    mixins: [SortableMixin],

    render() {
        const node = this.props.children;

        return this.renderWithSortable(node);
    },
});

module.exports = BackgroundSwitcherSortable;
