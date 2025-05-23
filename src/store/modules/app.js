export default {
  state: {
    isSideBarVisible: true,
  },
  mutations: {
    changeVisibleSideBar(state) {
      state.isSideBarVisible = !state.isSideBarVisible;
    },
  },
  getters: {
    getIsSideBarVisible(state) {
      return state.isSideBarVisible;
    },
  },
};
