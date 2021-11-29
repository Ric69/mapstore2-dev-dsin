import { UPDATE_SOMETHING } from '../actions/sample';
export default function(state = { text: 'Initial Text' }, action) {
    switch (action.type) {
        case UPDATE_SOMETHING:
            return {
                text: action.payload
            };
        default:
            return state;
    }
}