import {createApp, ref} from 'vue'
import {createI18n} from "vue-i18n";
import App from './App.vue'
import router from "./router/index.js";
import {createPinia} from "pinia";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import {useUserStore} from "./stores/user.js";

const app = createApp(App);
const locale = ref(localStorage.getItem("locale") || "en");

if (
    /^fr\b/.test(navigator.language) &&
    localStorage.getItem("locale") !== "en"
) {
    locale.value = "fr";
    localStorage.setItem("locale", "fr");
}

const i18n = createI18n({
    legacy: false,
    locale: locale.value,
    fallbackLocale: "en",
    globalInjection: true,
    messages: {
        en,
        fr,
    },
});

app.use(router).use(createPinia()).use(i18n).mount("#app");

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();
    const user = userStore.user;

    const pathsNeedAuth = ["/lobby"];

    if(pathsNeedAuth.includes(to.path) && !user.id) {
        next("/");
    } else {
        next();
    }
});
