<template>
  <v-navigation-drawer app clipped left width="338" :value="getIsSideBarVisible">
    <v-expansion-panels v-model="panel" multiple flat>
      <v-expansion-panel :style="{ maxWidth: '99%' }">
        <v-expansion-panel-header class="font-weight-regular" :style="{ fontSize: '1.25rem' }"
          >Профили</v-expansion-panel-header
        >
        <v-expansion-panel-content>
          <v-list dense>
            <v-list-item
              v-for="item in statusItems"
              :key="item.title"
              link
              @click="handleFilterProfile(item.value)"
            >
              <v-list-item-icon>
                <v-icon color="primary">{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title
                  class="font-weight-light"
                  :style="{
                    fontSize: '1rem',
                    color: currentFilter === item.value ? 'var(--main-color)' : 'black',
                  }"
                  :class="{ 'font-weight-bold': currentFilter === item.value }"
                  >{{ item.title }}</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  data: () => ({
    panel: [0],
    statusItems: [
      { title: 'Все', icon: 'mdi-check-circle', value: '' },
      { title: 'Обработанные', icon: 'mdi-check-circle', value: 'Basic Plan' },
      { title: 'Необработанные', icon: 'mdi-information', value: 'Trial' },
    ],
  }),
  computed: {
    ...mapGetters(['getIsSideBarVisible', 'getFilterByStatus']),
    currentFilter() {
      return this.getFilterByStatus;
    },
  },
  methods: {
    ...mapActions(['filterProfiles', 'fetchProfiles']),
    handleFilterProfile(filter) {
      if (Object.keys(this.$route.query).length) {
        this.$router.push({ query: {} });
      }

      this.filterProfiles(filter);
      this.fetchProfiles({
        page: 1,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
