<template>
  <v-app>
    <SideBar />
    <NavBar />

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import NavBar from '@/components/NavBar';
import SideBar from '@/components/SideBar';
import './global.css';
export default {
  name: 'App',
  components: {
    NavBar,
    SideBar,
  },
};
</script>
