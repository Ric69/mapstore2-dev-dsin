// custom action
export const LOAD_DATA = 'SAMPLE:LOAD_DATA';
export const LOADED_DATA = 'SAMPLE:LOADED_DATA';
export const LOAD_ERROR = 'SAMPLE:LOAD_ERROR';
export const loadData = () => {
    return {
        type: LOAD_DATA
    };
};

export const loadedData = (payload) => {
    return {
        type: LOADED_DATA,
        payload
    };
};

export const loadError = (error) => {
    return {
        type: LOAD_ERROR,
        error
    };
};
