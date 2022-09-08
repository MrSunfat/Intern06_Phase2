import axios from 'axios';
import { domain, userGroup } from '@/scripts/constants';

const userGroupsModule = {
    state: {
        userGroups: [],
        userGroup: {},
        totalUsers: 0,
        totalPage: 0,
        userGroupStart: 0,
        userGroupEnd: 0,
    },
    getters: {
        userGroups(state) {
            return state.userGroups;
        },
    },
    actions: {
        /**
         * Lấy dữ liệu người dùng
         * @param {*} param0
         * @param {*} idxPage
         * Author: TNDanh (7/9/2022)
         */
        async getAllUserGroup({ commit }) {
            try {
                const res = await axios.get(`${domain}/${userGroup}`);
                commit('setUserGroups', res.data);
                return res;
            } catch (error) {
                console.log(error);
            }
        },
    },
    mutations: {
        /**
         * Xét giá trị cho userGroups
         * @param {*} state
         * @param {*} userGroups
         * Author: TNDanh (8/9/2022)
         */
        setUserGroups(state, userGroups) {
            state.userGroups = userGroups;
        },
    },
};

export default userGroupsModule;
