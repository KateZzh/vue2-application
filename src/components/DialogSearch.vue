<template>
  <v-dialog v-model="dialog" persistent max-width="434" hide-overlay transition="slide-x-transition">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" height="30" min-width="30" rounded class="pa-0">
        <v-icon color="primary" size="20">mdi-magnify</v-icon>
      </v-btn>
    </template>

    <v-card class="dialogSearchCard">
      <v-card-text class="pa-0">
        <v-form ref="form">
          <v-container>
            <v-row>
              <v-col cols="12" class="pa-0" v-for="(field, index) in fields" :key="index">
                <v-label :for="field.key">{{ field.text }}</v-label>
                <v-text-field :id="field.key" v-model="field.value" solo hide-details></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-0">
        <v-spacer></v-spacer>
        <v-btn class="customBtn" outlined text @click="clearSearchParams"> Очистить </v-btn>
        <v-btn class="customBtn ml-5" depressed color="primary" @click="applySearchParams"> Применить </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data: () => ({
    dialog: false,
    fields: [
      { text: 'Имя', key: 'firstName', value: '' },
      { text: 'Фамилия', key: 'lastName', value: '' },
      { text: 'Компания', key: 'company', value: '' },
      { text: 'Специальность', key: 'job', value: '' },
      { text: 'Телефон', key: 'phone', value: '' },
      { text: 'Е-mail', key: 'email', value: '' },
      { text: 'Интересы', key: 'interests', value: '' },
    ],
  }),
  methods: {
    ...mapActions(['fetchProfiles', 'filterProfiles']),
    loadSearchParamsFromUrl() {
      this.fields.forEach(field => {
        const queryValue = this.$route.query[field.key];

        if (queryValue) {
          field.value = queryValue || '';
        }
      });
    },
    async applySearchParams() {
      const addQuerySearch = {};
      const currentQuerySearch = { ...this.$route.query };

      this.fields.forEach(field => {
        if (field.value && field.value.trim()) {
          addQuerySearch[field.key] = field.value.trim();
        }
      });

      if (!this.isSameSearchQuery(currentQuerySearch, addQuerySearch)) {
        this.$router.push({ query: addQuerySearch });
      }

      this.dialog = false;
      await this.fetchProfiles({ querySearch: addQuerySearch });
      this.filterProfiles('');
    },
    async clearSearchParams() {
      const clearedQuerySearch = { ...this.$route.query };

      this.fields.forEach(field => {
        delete clearedQuerySearch[field.key];
        field.value = '';
      });

      if (!this.isSameSearchQuery(this.$route.query, clearedQuerySearch)) {
        this.$router.push({ query: clearedQuerySearch });
      }

      await this.fetchProfiles({ querySearch: clearedQuerySearch });
    },
    isSameSearchQuery(currentQuery, addQuery) {
      const isSameObjectsLength = Object.keys(addQuery).length === Object.keys(currentQuery).length;
      const isSameObjectsKeys = Object.keys(addQuery).every(key => addQuery[key] === currentQuery[key]);
      const isSameObjectsValues = Object.values(addQuery).every(
        value => addQuery[value] === currentQuery[value]
      );

      return isSameObjectsLength && isSameObjectsKeys && isSameObjectsValues;
    },
  },
  mounted() {
    this.loadSearchParamsFromUrl();
  },
};
</script>

<style lang="scss" scoped>
.dialogSearchCard {
  position: absolute;
  padding: 30px;
  right: 0;
  top: 60px;
  width: 434px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.customBtn {
  width: 116px;
  height: 38px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  text-transform: none;
  letter-spacing: normal;
}
</style>
