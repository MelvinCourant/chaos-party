import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Lobby from '../views/Lobby.vue';
import CreatingTeams from '../views/CreatingTeams.vue';
import Drawing from '../views/Drawing.vue';
import Voting from '../views/Voting.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/:id',
      component: Home,
    },
    {
      path: '/lobby',
      component: Lobby,
    },
    {
      path: '/creating-teams',
      component: CreatingTeams,
    },
    {
      path: '/drawing',
      component: Drawing,
    },
    {
      path: '/voting',
      component: Voting,
    },
  ],
});

export default router;
