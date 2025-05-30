import Vue from 'vue';
import Vuex from 'vuex';
import profiles from './modules/profiles';
import app from './modules/app';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    profiles,
    app,
  },
});
