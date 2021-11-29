import { LOADED_DATA, LOAD_ERROR } from '../actions/sampledata';
export default function(state = { text: 'Initial Text TOTO' }, action) {
    switch (action.type) {
        case LOADED_DATA:
            return {
                text: action.payload
            };
        case LOAD_ERROR:
            return {
                error: action.error
            };
        default:
            return state;
    }
}