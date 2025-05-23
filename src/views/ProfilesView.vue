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
        <v-toolbar-title class="font-h6">{{ showCurrentStatusTitle }}</v-toolbar-title>
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
            <v-list-item v-for="(item, index) in dropdownItems" :key="index" link @click="item.click">
              <v-list-item-title class="body-2">{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-dialog
          v-if="action === actionProfile.DELETE"
          v-model="isOpenedDialog"
          persistent
          max-width="550px"
        >
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this profile?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="handleDialogCancel">Отмена</v-btn>
              <v-btn color="blue darken-1" text @click="handleDeleteProfile">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog
          v-if="action !== actionProfile.DELETE"
          v-model="isOpenedDialog"
          persistent
          max-width="434px"
        >
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text class="px-5 py-0">
              <v-form ref="form">
                <v-container>
                  <v-row>
                    <v-col cols="12" class="pa-0 ma-0" v-for="(field, index) in fields" :key="index">
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
              <v-btn color="blue darken-1" text @click="handleEditProfile">Сохранить</v-btn>
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
      <v-icon color="primary" size="20" v-if="action === actionProfile.EDIT" @click="handleEditItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon
        color="primary"
        size="20"
        v-else-if="action === actionProfile.DELETE"
        @click="handleOpenDialog(item)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { actionsProfile } from '@/constants';

export default {
  data: () => ({
    options: {},
    dropdownItems: [],
    isOpenedActionMenu: false,
    isOpenedDialog: false,
    isActionIconVisible: false,
    action: actionsProfile.ADD,
    statusItems: [
      { title: 'Все', value: '' },
      { title: 'Обработанные', value: 'Basic Plan' },
      { title: 'Необработанные', value: 'Trial' },
    ],
    fields: [
      { text: 'Имя', key: 'firstName', value: '' },
      { text: 'Фамилия', key: 'lastName', value: '' },
      { text: 'Компания', key: 'company', value: '' },
      { text: 'Специальность', key: 'job', value: '' },
      { text: 'Телефон', key: 'phone', value: '' },
      { text: 'Е-mail', key: 'email', value: '' },
      { text: 'Интересы', key: 'interests', value: '' },
    ],
    editedItem: {
      firstName: '',
      lastName: '',
      company: '',
      job: '',
      phone: '',
      email: '',
      interests: '',
    },
    defaultItem: {
      firstName: '',
      lastName: '',
      company: '',
      job: '',
      phone: '',
      email: '',
      interests: '',
    },
  }),
  created() {
    this.dropdownItems = [
      { title: 'Добавить', click: this.handleActionAdd },
      { title: 'Изменить', click: this.handleActionEdit },
      { title: 'Удалить', click: this.handleActionDelete },
    ];
  },
  computed: {
    ...mapGetters({
      profiles: 'getProfiles',
      totalCountProfiles: 'getTotalCountProfiles',
      totalPages: 'getTotalPages',
      isLoading: 'getIsLoading',
      filterByStatus: 'getFilterByStatus',
    }),
    headers() {
      const baseHeaders = [
        { text: 'Имя', value: 'firstName', sortable: false },
        { text: 'Фамилия', value: 'lastName', sortable: false },
        { text: 'Компания', value: 'company', sortable: false },
        { text: 'Специальность', value: 'job', sortable: false },
        { text: 'Телефон', value: 'phone', sortable: false },
        { text: 'Е-mail', value: 'email', sortable: false },
        { text: 'Интересы', value: 'interests', sortable: false },
      ];

      let headers = [];
      if (!this.filterByStatus) {
        headers = [{ text: 'Статус', value: 'plan', sortable: false }, ...baseHeaders];
      } else {
        headers = [...baseHeaders];
      }

      if (this.isActionIconVisible) {
        headers = [...headers, { text: 'Действие', value: 'action', sortable: false, align: 'center' }];
      }

      return headers;
    },
    showCurrentStatusTitle() {
      const currentStatus = this.statusItems.find(el => el.value === this.filterByStatus);
      return currentStatus ? currentStatus.title : 'Unknown';
    },
    actionProfile() {
      return actionsProfile;
    },
    formTitle() {
      return this.action === this.actionProfile.ADD ? 'Добавить' : 'Изменить';
    },
  },
  methods: {
    ...mapActions(['fetchProfiles', 'deleteProfile', 'updateProfile', 'addProfile']),
    async handleRefreshData() {
      if (Object.keys(this.$route.query).length) {
        this.$router.push({ query: {} });
      }
      await this.fetchProfiles({ ...this.options });
      this.isActionIconVisible = false;
    },
    async handleDeleteProfile() {
      this.isOpenedDialog = false;
      await this.deleteProfile(this.editedItem.id);
      this.handleRefreshData(this.options);
    },
    async handleEditProfile() {
      this.isOpenedDialog = false;
      this.isActionIconVisible = false;

      if (this.action === this.actionProfile.ADD) {
        await this.addProfile(this.editedItem);
        this.handleRefreshData(this.options);
      } else {
        await this.updateProfile(this.editedItem);
      }

      this.editedItem = { ...this.defaultItem };
    },
    handleActionDelete() {
      this.isActionIconVisible = true;
      this.action = actionsProfile.DELETE;
    },
    handleActionEdit() {
      this.isActionIconVisible = true;
      this.action = actionsProfile.EDIT;
    },
    handleActionAdd() {
      this.action = actionsProfile.ADD;
      this.isOpenedDialog = true;
    },
    handleOpenDialog(item) {
      this.editedItem = { ...item };
      this.isOpenedDialog = true;
    },
    handleEditItem(item) {
      this.editedItem = { ...item };
      this.isOpenedDialog = true;
    },
    handleDialogCancel() {
      this.isOpenedDialog = false;
      this.editedItem = { ...this.defaultItem };

      if (this.isActionIconVisible) {
        this.isActionIconVisible = false;
      }
    },
  },
  watch: {
    options: {
      handler() {
        if (Object.keys(this.$route.query).length) {
          this.$router.push({ query: {} });
        }
        this.fetchProfiles({ ...this.options });
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped></style>
