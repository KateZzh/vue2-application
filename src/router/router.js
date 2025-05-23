import ProfilesView from '@/views/ProfilesView.vue';
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [{ path: '/', component: ProfilesView }];

export default new VueRouter({
  mode: 'history',
  routes,
});
