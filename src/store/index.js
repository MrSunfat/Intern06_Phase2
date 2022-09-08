import { createStore } from 'vuex';
import usersModule from './modules/users';
import userGroupsModule from './modules/userGroups';

const storeData = {
    modules: {
        usersModule,
        userGroupsModule,
    },
};

const store = createStore(storeData);
export default store;
