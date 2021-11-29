const { isEmpty } = require('lodash');
const { userSelector } = require('../../../MapStore2/web/client/selectors/security');

const userDepartmentSelector = (state) => {
    const user = userSelector(state);
    let department = [];
    if (!!user) {
        if (!!user.attribute) {
            for (let key in user.attribute) {
                if (user.attribute[key].name === 'department' && user.attribute[key].value) {
                    department.push(user.attribute[key].value.split('-')[0]);
                }
            }
        }

        if (isEmpty(department)) {
            if (user.groups && user.groups.group) {
                user.groups.group.map((g) => {
                    if (g.groupName) {
                        department.push(g.groupName.split('-')[0]);
                    }
                });
            }
        }
    }

    return department;
};

module.exports = { userDepartmentSelector };
