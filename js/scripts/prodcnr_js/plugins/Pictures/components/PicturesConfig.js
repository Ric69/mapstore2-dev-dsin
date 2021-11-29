module.exports = {
    /**
     * Available picture fields.
     * A list of object specifying:
     *  - name: the field synthetic name
     *  - type: type of value for the field (text or html)
     *  - validator: (optional) rule for validation
     *  - validationError: (optional) id for the translations file containing the validation error message
     *  - showLabel: wether to show or not the label of the field in the viewer / editor
     *  - editable: wether the field can be edited or not in editing mode
     */
    fields: [
        {
            name: 'picture',
            type: 'img',
            showLabel: true,
            editable: true,
        },
        {
            name: 'description',
            type: 'html',
            showLabel: true,
            editable: true,
        },
    ],
};
