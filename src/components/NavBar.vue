<template>
  <v-app-bar app clipped-left flat color="primary" height="60" elevation="0">
    <v-app-bar-nav-icon color="white" @click="changeVisibleSideBar"></v-app-bar-nav-icon>
    <v-spacer></v-spacer>
    <DialogSearch />
  </v-app-bar>
</template>

<script>
import DialogSearch from './DialogSearch.vue';

export default {
  data: () => ({}),
  components: {
    DialogSearch,
  },

  methods: {
    changeVisibleSideBar() {
      this.$store.commit('changeVisibleSideBar');
    },
  },
};
</script>

<style lang="scss" scoped></style>
