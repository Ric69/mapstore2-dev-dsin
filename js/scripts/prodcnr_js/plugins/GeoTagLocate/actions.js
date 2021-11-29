const TOGGLE_FILTER = 'TOGGLE_USER_FILTER';
const SET_FILTER_INFOS = 'SET_FILTER_INFOS';

function toggleFilter() {
    return {
        type: TOGGLE_FILTER,
    };
}

function setFilterInfos(payload) {
    return {
        type: SET_FILTER_INFOS,
        payload,
    };
}

module.exports = {
    TOGGLE_FILTER,
    SET_FILTER_INFOS,
    toggleFilter,
    setFilterInfos,
};
