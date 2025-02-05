<script setup>
import "../../assets/css/components/layouts/_footer.scss";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const year = new Date().getFullYear();
const links = [
  { name: t("legal_notices"), url: "/legal-notices" },
  { name: "Cookies", url: "/cookies" },
  { name: "Contact", url: "/contact" },
];
const contributors = [
  {
    name: "Melvin Courant",
    role: t("melvin_role"),
    image: "melvin-courant.jpg",
    url: "https://melvincourant.fr/"
  },
];

function generateImageUrl(image) {
  return new URL(`../../assets/imgs/contributors/${image}`, import.meta.url).href;
}
</script>

<template>
  <footer class="footer">
    <p class="footer__copyright">Copyright @ {{ year }} Chaos Party</p>
    <nav class="footer__nav">
      <ul class="footer__links">
        <li
          v-for="link in links"
          :key="link.name"
          class="footer__item"
        >
          <router-link
            :to="link.url"
            class="footer__link"
          >
            {{ link.name }}
          </router-link>
          <span
            class="footer__dash"
            v-if="
                contributors.length > 0 &&
                links.indexOf(link) !== links.length - 1
              "
          >
            - 
            </span>
        </li>
      </ul>
    </nav>
    <ul class="contributors">
      <li
        v-for="contributor in contributors"
        :key="contributor.name"
        class="contributors__contributor"
      >
        <a
          :href="contributor.url"
          :title="`${contributor.name} - ${contributor.role}`"
          target="_blank"
          class="contributors__link"
        >
          <img
            :src="generateImageUrl(contributor.image)"
            :alt="contributor.name"
            class="contributors__image"
          />
        </a>
      </li>
    </ul>
  </footer>
</template>