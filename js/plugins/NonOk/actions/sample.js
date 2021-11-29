export const UPDATE_SOMETHING = 'SAMPLE:UPDATE_SOMETHING';
export const updateSomething = (payload) => {
    return {
        type: UPDATE_SOMETHING,
        payload
    };
};