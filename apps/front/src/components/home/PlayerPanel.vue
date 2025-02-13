<script setup>
import '../../assets/css/components/home/_player-panel.scss';
import Select from "../inputs/Select.vue";
import {reactive} from "vue";
import { useUserStore } from "../../stores/user.js";
import {useRoute} from "vue-router";
import { useI18n } from "vue-i18n";
import Settings from "../inputs/Settings.vue";
import Avatar from "../utils/Avatar.vue";
import Field from "../inputs/Field.vue";
import Button from "../inputs/Button.vue";
import Icon from "../utils/Icon.vue";

defineEmits(["submitPlayer"]);

const userStore = useUserStore();
const user = userStore.user;
const route = useRoute();
const params = route.params;
const id = params.id;
const { t } = useI18n();
const selectOptions = reactive([
  {
    "label": "EN",
    "value": "en",
    "selected": false
  },
  {
    "label": "FR",
    "value": "fr",
    "selected": false
  }
]);
const pseudoInputAttributes = {
  "id": "pseudo",
  "type": "text",
  "placeholder": "Pseudo",
  "value": user.pseudo || "",
  "maxLength": 15
};
const partyButton = reactive({
  "icon": "play",
  "text": t('create_party')
});
const formValues = reactive({
  "pseudo": user.pseudo || "",
  "image": ""
});

if(id) {
  partyButton.text = t('join_party');
  partyButton.icon = "join-yellow";
}

selectOptions.forEach((option) => {
  if (option.value === userStore.language) {
    option.selected = true;
  }
});

function updateLanguage(value) {
  selectOptions.forEach((option) => {
    if(option.value === value) {
      option.selected = true;
    } else if(
      option.selected === true &&
      option.value !== value
    ) {
      option.selected = false;
    }
  });

  userStore.updateLanguage(value);
}
</script>

<template>
  <div class="player-planel">
    <div class="player-planel__head">
      <Select
        :options="selectOptions"
        @change="updateLanguage($event)"
      >
        <svg
            style="min-width: 26px;"
            xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9.2763 3.3022C8.26843 5.5195 7.58956 8.56697 7.47827 12H18.446C18.3347 8.56697 17.6558 5.5195 16.6479 3.3022C15.8736 1.59856 14.9929 0.552313 14.1447 0.0530653C13.7552 0.017943 13.3608 0 12.9621 0C12.5635 0 12.169 0.0179422 11.7796 0.053063C10.9314 0.552309 10.0507 1.59855 9.2763 3.3022ZM8.32569 0.851139C8.00559 1.357 7.71519 1.90341 7.45556 2.47459C6.31098 4.99267 5.58894 8.33279 5.4773 12H-8.33552e-10C0.388739 6.88969 3.73213 2.60523 8.32569 0.851139ZM17.5986 0.851149C17.9187 1.357 18.2091 1.90341 18.4687 2.47459C19.6133 4.99267 20.3353 8.33279 20.4469 12H25.9242C25.5355 6.8897 22.1921 2.60525 17.5986 0.851149ZM25.9242 14H20.4469C20.3353 17.6673 19.6133 21.0074 18.4687 23.5255C18.2091 24.0966 17.9187 24.643 17.5986 25.1488C22.1921 23.3947 25.5355 19.1103 25.9242 14ZM14.1448 25.9469C13.7553 25.9821 13.3608 26 12.9621 26C12.5634 26 12.169 25.9821 11.7795 25.9469C10.9313 25.4477 10.0507 24.4014 9.2763 22.6978C8.26843 20.4806 7.58956 17.4331 7.47827 14H18.446C18.3347 17.4331 17.6558 20.4806 16.6479 22.6978C15.8736 24.4014 14.993 25.4477 14.1448 25.9469ZM8.32565 25.1488C3.73213 23.3947 0.388764 19.1103 4.57891e-06 14H5.4773C5.58894 17.6673 6.31098 21.0074 7.45556 23.5255C7.71518 24.0966 8.00557 24.643 8.32565 25.1488Z"/>
        </svg>
      </Select>

      <Settings />
    </div>
    <form
      class="player-planel__form"
      @submit.prevent="$emit('submitPlayer', formValues)"
    >
      <Avatar type="choice"/>
      <Field
        :label="t('choose_pseudo')"
        :attributes="pseudoInputAttributes"
        @updateValue="formValues.pseudo = $event"
      />
      <Button
        type="primary"
        :text="partyButton.text"
      >
        <Icon
          :icon="partyButton.icon"
          type="button"
        />
      </Button>
    </form>
  </div>
</template>