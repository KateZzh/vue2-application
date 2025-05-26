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

        <ProfileDialog
          :is-open.sync="isOpenDialog"
          :edited-item.sync="editedItem"
          :action="action"
          :profile-fields="profileFields"
          @cancel="handleDialogCancel"
          @confirm="handleDialogConfirm"
        />
      </v-toolbar>
    </template>

    <template v-slot:[`item.plan`]="{ item }">
      <v-icon :color="item.plan === profileStatusValue.UNPROCESSED ? 'error' : 'primary'">{{
        item.plan === profileStatusValue.UNPROCESSED ? 'mdi-cloud-alert' : 'mdi-cloud-check-variant'
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
import {
  profileActions,
  profileFields,
  profileStatusItems,
  defaultProfileItem,
  profileStatusValue,
} from '@/constants';
import ProfileDialog from '@/components/ProfileDialog';

export default {
  components: {
    ProfileDialog,
  },
  data: () => ({
    options: {},
    isOpenedActionMenu: false,
    isOpenDialog: false,
    isActionIconVisible: false,
    action: profileActions.ADD,
    editedItem: { ...defaultProfileItem },
    profileFields,
    profileActions,
    profileStatusValue,
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
      this.isOpenDialog = false;

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
      this.isOpenDialog = true;
    },
    handleOpenDialog(item) {
      this.editedItem = { ...item };
      this.isOpenDialog = true;
    },
    handleDialogCancel() {
      this.isOpenDialog = false;
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
