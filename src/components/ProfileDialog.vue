<template>
  <v-dialog :value="isOpen" @input="$emit('update:is-open', $event)" persistent max-width="430px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ profileDialogTitle }}</span>
      </v-card-title>
      <v-card-text v-if="isDeleteMode"
        >Are you sure you want to delete this profile {{ fullName }}?</v-card-text
      >
      <v-card-text v-else class="px-5 py-0">
        <v-form ref="form">
          <v-container>
            <v-row>
              <v-col cols="12" class="pa-0 ma-0" v-for="(field, index) in profileFields" :key="index">
                <v-label :for="field.key">{{ field.text }}</v-label>
                <v-text-field
                  :id="field.key"
                  :value="editedItem[field.key]"
                  @input="updateField(field.key, $event)"
                  solo
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions class="pb-4">
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="$emit('cancel')">Отмена</v-btn>
        <v-btn color="primary" text @click="$emit('confirm')">{{ isDeleteMode ? 'OK' : 'Сохранить' }}</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { profileActions } from '@/constants';

export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    action: {
      type: String,
      required: true,
    },
    profileFields: {
      type: Array,
      required: true,
    },
    editedItem: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    profileActions,
  }),
  computed: {
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
    fullName() {
      return `"${this.editedItem.firstName} ${this.editedItem.lastName}"`;
    },
    isDeleteMode() {
      return this.action === profileActions.DELETE;
    },
  },
  methods: {
    updateField(key, value) {
      this.$emit('update:edited-item', { ...this.editedItem, [key]: value });
    },
  },
};
</script>

<style lang="scss" scoped></style>
