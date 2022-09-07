import { createStore } from 'vuex';
import usersModule from './modules/users';

const storeData = {
    modules: {
        usersModule,
    },
};

const store = createStore(storeData);
export default store;
