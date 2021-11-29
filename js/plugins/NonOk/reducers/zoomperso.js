// @mapstore is an alias for dir_name/web/client (see webpack.config.js)
import {PAN_TO} from '@mapstore/actions/map';

export default function map(state, action) {
    switch (action.type) {
        case PAN_TO: {
            return {
                ...state,
                center: action.center
            };
        }
        default: return state;
    }
};