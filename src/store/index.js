import { createStore } from 'vuex';
import usersModule from './modules/users';
import userGroupsModule from './modules/userGroups';
import jobTitlesModule from './modules/jobTitles';

const storeData = {
    modules: {
        usersModule,
        userGroupsModule,
        jobTitlesModule,
    },
};

const store = createStore(storeData);
export default store;
