// this is a dumb component
const MyComponent = require('../components/ImageButton');
const {connect} = require('@mapstore/utils/PluginsUtils');

// let's wire it to state and actions
const MyPlugin = connect((state) => ({
   myproperty: state.myreducer.property
}), {
   additionallayers
})(MyComponent);

// let's export the plugin and a set of required reducers
const myreducer = require('../reducers/additionallayers');
module.exports = {
   MyPlugin,
   reducers: {myreducer}
};