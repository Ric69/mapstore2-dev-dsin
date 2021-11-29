import * as Rx from 'rxjs';
import axios from 'axios';

import { LOAD_DATA, loadedData, loadError } from '../actions/sampledata';

export const loadDataEpic = (action$) => {
    return action$.ofType(LOAD_DATA)
        .switchMap(() => {
            return Rx.Observable.defer(() => axios.get('version.txt'))
                .switchMap((response) => Rx.Observable.of(loadedData(response.data)))
                .catch(e => Rx.Observable.of(loadError(e.message)));
        });
};

export default {
    loadDataEpic
};