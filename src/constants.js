export const BASE_URL = 'https://retoolapi.dev/wXtqL8/data';
export const DEFAULT_ITEMS_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;

export const profileActions = Object.freeze({
  DELETE: 'delete',
  EDIT: 'edit',
  ADD: 'add',
});

export const profileFields = [
  { text: 'Имя', key: 'firstName' },
  { text: 'Фамилия', key: 'lastName' },
  { text: 'Компания', key: 'company' },
  { text: 'Специальность', key: 'job' },
  { text: 'Телефон', key: 'phone' },
  { text: 'Е-mail', key: 'email' },
  { text: 'Интересы', key: 'interests' },
];

export const profileStatusValue = Object.freeze({
  ALL: '',
  PROCESSED: 'Basic Plan',
  UNPROCESSED: 'Trial',
});

export const profileStatusItems = [
  { title: 'Все', value: profileStatusValue.ALL },
  { title: 'Обработанные', value: profileStatusValue.PROCESSED },
  { title: 'Необработанные', value: profileStatusValue.UNPROCESSED },
];

export const defaultProfileItem = {
  firstName: '',
  lastName: '',
  company: '',
  job: '',
  phone: '',
  email: '',
  interests: '',
};
