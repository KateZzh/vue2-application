import axios from 'axios';
import { BASE_URL, DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '@/constants';

export default {
  state: {
    profiles: [],
    totalCountProfiles: 0,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    isLoading: false,
    filterByStatus: '',
  },
  mutations: {
    setProfiles(state, payload) {
      state.profiles = payload;
    },
    deleteProfileMutation(state, id) {
      const index = state.profiles.findIndex(profile => profile.id === id);
      if (index != -1) {
        state.profiles.splice(index, 1);
      }
    },
    updateProfileMutation(state, payload) {
      const index = state.profiles.findIndex(profile => profile.id === payload.id);
      if (index != -1) {
        state.profiles.splice(index, 1, { ...state.profiles[index], ...payload });
      }
    },
    setTotalCountProfiles(state, payload) {
      state.totalCountProfiles = payload;
    },
    setItemsPerPage(state, payload) {
      state.itemsPerPage = payload;
    },
    setIsLoading(state, payload) {
      state.isLoading = payload;
    },
    setFilterByStatus(state, payload) {
      state.filterByStatus = payload;
    },
    SetSearchParams(state, payload) {
      state.searchParams = payload;
    },
  },
  getters: {
    getProfiles(state) {
      return state.profiles;
    },
    getTotalCountProfiles(state) {
      return state.totalCountProfiles;
    },
    getTotalPages(state) {
      return Math.ceil(state.totalCountProfiles / state.itemsPerPage);
    },
    getIsLoading(state) {
      return state.isLoading;
    },
    getFilterByStatus(state) {
      return state.filterByStatus;
    },
  },
  actions: {
    async fetchProfiles({ commit, state }, options) {
      const { page = DEFAULT_PAGE, itemsPerPage = DEFAULT_ITEMS_PER_PAGE, querySearch = {} } = options;

      const filter = !Object.keys(querySearch).length ? { plan: state.filterByStatus } : { ...querySearch };

      const params = {
        _page: page,
        _limit: itemsPerPage,
        ...filter,
      };

      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key];
        }
      });

      try {
        commit('setIsLoading', true);
        const res = await axios.get(BASE_URL, { params });

        const totalCount = res.headers['x-total-count'];

        if (totalCount) {
          commit('setTotalCountProfiles', +totalCount);
          commit('setItemsPerPage', itemsPerPage);
        }

        commit('setProfiles', res.data);
      } catch (error) {
        console.error(error);
        commit('setProfiles', []);
      } finally {
        commit('setIsLoading', false);
      }
    },
    async deleteProfile({ commit }, id) {
      try {
        commit('setIsLoading', true);
        await axios.delete(`${BASE_URL}/${id}`);
        commit('deleteProfileMutation', id);
      } catch (error) {
        console.error(error);
      } finally {
        commit('setIsLoading', false);
      }
    },
    async updateProfile({ commit }, payload) {
      const { id, ...body } = payload;

      try {
        commit('setIsLoading', true);
        const res = await axios.put(`${BASE_URL}/${payload.id}`, body);
        commit('updateProfileMutation', res.data);
      } catch (error) {
        console.error(error);
      } finally {
        commit('setIsLoading', false);
      }
    },
    async addProfile({ commit }, payload) {
      try {
        commit('setIsLoading', true);
        await axios.post(`${BASE_URL}`, { ...payload, plan: 'Trial' });
      } catch (error) {
        console.error(error);
      } finally {
        commit('setIsLoading', false);
      }
    },
    filterProfiles({ commit }, filter) {
      commit('setFilterByStatus', filter);
    },
  },
};
