<template>
  <v-data-table
    :headers="headers"
    :items="profiles"
    :server-items-length="totalCountProfiles"
    :options.sync="options"
    :loading="isLoading"
    class="elevation-1"
    :footer-props="{
      itemsPerPageText: 'Количество элементов на странице:',
      pageText: `{0}-{1} из ${totalPages}`,
      itemsPerPageAllText: 'Все',
    }"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title class="font-h6">{{ currentStatusTitle }}</v-toolbar-title>
        <v-btn icon class="ml-2" @click="handleRefreshData">
          <v-icon color="primary">mdi-refresh</v-icon>
        </v-btn>
        <v-spacer></v-spacer>

        <v-menu bottom offset-y v-model="isOpenedActionMenu">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              v-bind="attrs"
              v-on="on"
              class="body-2"
              :style="{ textTransform: 'none', width: '210px' }"
            >
              Действия <v-icon>{{ isOpenedActionMenu ? 'mdi-menu-up' : 'mdi-menu-down' }}</v-icon></v-btn
            >
          </template>

          <v-list>
            <v-list-item v-for="(item, index) in dropdownItems" :key="index" link @click="item.handler">
              <v-list-item-title class="body-2">{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-dialog v-model="isOpenedDialog" persistent max-width="434px">
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ profileDialogTitle }}</span>
            </v-card-title>
            <v-card-text v-if="action === profileActions.DELETE"
              >Are you sure you want to delete this profile "{{
                editedItem.firstName + ' ' + editedItem.lastName
              }}"?</v-card-text
            >
            <v-card-text v-else class="px-5 py-0">
              <v-form ref="form">
                <v-container>
                  <v-row>
                    <v-col cols="12" class="pa-0 ma-0" v-for="(field, index) in profileFields" :key="index">
                      <v-label :for="field.key">{{ field.text }}</v-label>
                      <v-text-field :id="field.key" v-model="editedItem[field.key]" solo></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>
            <v-card-actions class="pb-4">
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="handleDialogCancel">Отмена</v-btn>
              <v-btn color="blue darken-1" text @click="handleDialogConfirm">{{
                action === profileActions.DELETE ? 'OK' : 'Сохранить'
              }}</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>

    <template v-slot:[`item.plan`]="{ item }">
      <v-icon :color="item.plan !== 'Trial' ? 'primary' : 'error'">{{
        item.plan !== 'Trial' ? 'mdi-cloud-check-variant' : 'mdi-cloud-alert'
      }}</v-icon>
    </template>
    <template v-slot:[`item.action`]="{ item }">
      <v-icon color="primary" size="20" v-if="action === profileActions.EDIT" @click="handleOpenDialog(item)">
        mdi-pencil
      </v-icon>
      <v-icon
        color="primary"
        size="20"
        v-else-if="action === profileActions.DELETE"
        @click="handleOpenDialog(item)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { profileActions, profileFields, profileStatusItems, defaultProfileItem } from '@/constants';

export default {
  data: () => ({
    options: {},
    isOpenedActionMenu: false,
    isOpenedDialog: false,
    isActionIconVisible: false,
    action: profileActions.ADD,
    editedItem: { ...defaultProfileItem },
    profileFields,
    profileActions,
  }),
  computed: {
    ...mapGetters({
      profiles: 'getProfiles',
      totalCountProfiles: 'getTotalCountProfiles',
      totalPages: 'getTotalPages',
      isLoading: 'getIsLoading',
      filterByStatus: 'getFilterByStatus',
    }),
    dropdownItems() {
      return [
        { title: 'Добавить', handler: this.handleActionAdd },
        { title: 'Изменить', handler: this.handleActionEdit },
        { title: 'Удалить', handler: this.handleActionDelete },
      ];
    },
    headers() {
      const baseHeaders = profileFields.map(field => ({
        text: field.text,
        value: field.key,
        sortable: false,
      }));

      let headers = this.filterByStatus
        ? [...baseHeaders]
        : [{ text: 'Статус', value: 'plan', sortable: false }, ...baseHeaders];

      if (this.isActionIconVisible) {
        headers.push({ text: 'Действие', value: 'action', sortable: false, align: 'center' });
      }

      return headers;
    },
    currentStatusTitle() {
      const currentStatus = profileStatusItems.find(el => el.value === this.filterByStatus);
      return currentStatus?.title || 'Unknown';
    },
    profileDialogTitle() {
      switch (this.action) {
        case profileActions.ADD:
          return 'Добавить';
        case profileActions.EDIT:
          return 'Изменить';
        default:
          return 'Удалить';
      }
    },
  },
  methods: {
    ...mapActions(['fetchProfiles', 'deleteProfile', 'updateProfile', 'addProfile']),
    async loadProfilesData(resetPage = false) {
      if (Object.keys(this.$route.query).length) {
        this.$router.push({ query: {} });
      }

      if (resetPage) {
        this.options = { ...this.options, page: 1 };
      }

      await this.fetchProfiles({ ...this.options });
    },
    async handleRefreshData() {
      await this.loadProfilesData(true);
      if (this.isActionIconVisible) {
        this.isActionIconVisible = false;
      }
    },
    async handleDialogConfirm() {
      this.isOpenedDialog = false;

      if (this.action === profileActions.ADD) {
        await this.addProfile(this.editedItem);
        this.handleRefreshData();
      } else if (this.action === profileActions.DELETE) {
        await this.deleteProfile(this.editedItem.id);
        this.handleRefreshData();
      } else {
        await this.updateProfile(this.editedItem);
      }

      this.resetForm();
    },
    handleActionDelete() {
      this.isActionIconVisible = true;
      this.action = profileActions.DELETE;
    },
    handleActionEdit() {
      this.isActionIconVisible = true;
      this.action = profileActions.EDIT;
    },
    handleActionAdd() {
      this.action = profileActions.ADD;
      this.isOpenedDialog = true;
    },
    handleOpenDialog(item) {
      this.editedItem = { ...item };
      this.isOpenedDialog = true;
    },
    handleDialogCancel() {
      this.isOpenedDialog = false;
      this.resetForm();
    },
    resetForm() {
      this.editedItem = { ...defaultProfileItem };
      this.isActionIconVisible = false;
    },
  },
  watch: {
    options: {
      handler() {
        this.loadProfilesData();
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped></style>
