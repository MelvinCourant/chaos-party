import {createApp, ref} from 'vue'
import { createI18n } from "vue-i18n";
import App from './App.vue'
import router from "./router/index.js";
import {createPinia} from "pinia";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

const app = createApp(App);
const locale = ref("en");

if (/^fr\b/.test(navigator.language)) {
    locale.value = "fr";
}

const i18n = createI18n({
    legacy: false,
    locale: locale.value,
    fallbackLocale: "en",
    messages: {
        en,
        fr,
    },
});

app.use(router).use(createPinia()).use(i18n).mount("#app");
