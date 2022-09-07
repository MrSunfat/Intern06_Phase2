import axios from 'axios';
import { domain, user } from '@/scripts/constants';
import { statusTagEnum } from '@/scripts/enum';

const usersModule = {
    state: {
        users: [],
        totalUsers: 0,
        totalPage: 0,
        userStart: 0,
        userEnd: 0,
        pageIndex: 1,
    },
    getters: {
        users(state) {
            return state.users.map((user) => {
                return {
                    ...user,
                    Status:
                        user.Status === 3
                            ? statusTagEnum.Content.Work
                            : statusTagEnum.Content.InActive,
                };
            });
        },
        totalUsers(state) {
            return state.totalUsers;
        },
        totalPage(state) {
            return state.totalPage;
        },
        userStart(state) {
            return state.userStart;
        },
        userEnd(state) {
            return state.userEnd;
        },
    },
    actions: {
        /**
         * Lấy dữ liệu người dùng
         * @param {*} param0
         * @param {*} idxPage
         * Author: TNDanh (7/9/2022)
         */
        async getUsers({ commit }, pageDetail) {
            try {
                const res = await axios.get(`${domain}/${user}/Filter`, {
                    params: {
                        pageSize: pageDetail.pageSize,
                        pageNumber: pageDetail.pageNumber,
                        searchWord: pageDetail?.searchWord,
                        userGroupName: pageDetail?.userGroupName,
                    },
                });

                commit('setUsers', res.data.Data);
                commit('setTotalUsers', res.data.TotalRecord);
                commit('setTotalPage', res.data.TotalPage);
                commit('setUserStart', res.data.UserStart);
                commit('setUserEnd', res.data.UserEnd);
                return res;
            } catch (error) {
                console.log(error);
            }
        },
    },
    mutations: {
        /**
         * Xét giá trị cho users
         * @param {*} state
         * @param {*} users
         * Author: TNDanh (7/9/2022)
         */
        setUsers(state, users) {
            state.users = users;
        },
        /**
         * Xét giá trị cho totalUsers
         * Author: TNDanh (7/9/2022)
         */
        setTotalUsers(state, totalUsers) {
            state.totalUsers = totalUsers;
        },
        /**
         * Xét giá trị cho totalPage
         * Author: TNDanh (7/9/2022)
         */
        setTotalPage(state, totalPage) {
            state.totalPage = totalPage;
        },
        /**
         * Xét giá trị cho userStart
         * Author: TNDanh (7/9/2022)
         */
        setUserStart(state, userStart) {
            state.userStart = userStart;
        },
        /**
         * Xét giá trị cho userEnd
         * Author: TNDanh (7/9/2022)
         */
        setUserEnd(state, userEnd) {
            state.userEnd = userEnd;
        },
        /**
         * Xét status cho user
         * Author: TNDanh (7/9/2022)
         */
        setStatusUser(state, { index, content }) {
            state.users[index].Status = content;
        },
    },
};

export default usersModule;
