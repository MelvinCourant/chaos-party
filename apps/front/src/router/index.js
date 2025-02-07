import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Lobby from "../views/Lobby.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Home,
    },
    {
      path: "/:id",
      component: Home,
    },
    {
      path: "/lobby",
      component: Lobby,
    }
  ],
});

export default router;
