<script setup>
import '../assets/css/views/_creating-teams.scss';
import { useI18n } from "vue-i18n";
import { useUserStore } from "../stores/user.js";
import { useSocketStore } from "../stores/socket.js";
import { usePartyStore } from "../stores/party.js";
import router from "../router/index.js";
import CopyLink from "../components/utils/CopyLink.vue";
import Settings from "../components/inputs/Settings.vue";
import Icon from "../components/utils/Icon.vue";
import Button from "../components/inputs/Button.vue";
import {reactive, ref, provide, onMounted} from "vue";
import Configurations from "../components/creating_teams/Configurations.vue";
import Teams from "../components/creating_teams/Teams.vue";

const env = import.meta.env;
const { t } = useI18n();
const { socket } = useSocketStore();
const userStore = useUserStore();
const user = userStore.user;
const partyStore = usePartyStore();
const partyId = partyStore.partyId;
const hostId = partyStore.hostId;
const numberTeamsSelect = reactive([
  {
    "label": t("number_teams", { quantity: 2 }),
    "value": 2,
    "selected": true
  },
  {
    "label": t("number_teams", { quantity: 3 }),
    "value": 3,
    "selected": false
  },
  {
    "label": t("number_teams", { quantity: 4 }),
    "value": 4,
    "selected": false
  }
]);
const configurations = reactive([
  {
    "title": t("drawing_time.title"),
    "description": t("drawing_time.description"),
    "icon": "time",
    "attributes": {
      "disabled": hostId !== user.id,
      "id": "drawing-time"
    },
    "options": [
      {
        "label": "1 minute",
        "value": 1,
        "selected": false
      },
      {
        "label": "2 minutes",
        "value": 2,
        "selected": false
      },
      {
        "label": "3 minutes",
        "value": 3,
        "selected": true
      }
    ]
  },
  {
    "title": t("voting_time.title"),
    "description": t("voting_time.description"),
    "icon": "time",
    "attributes": {
      "disabled": hostId !== user.id,
      "id": "voting-time"
    },
    "options": [
      {
        "label": t("seconds", { number: 30 }),
        "value": 0.5,
        "selected": false
      },
      {
        "label": "1 minute",
        "value": 1,
        "selected": true
      },
      {
        "label": "1 minute 30",
        "value": 1.5,
        "selected": false
      }
    ]
  },
  {
    "title": t("defilement.title"),
    "description": t("defilement.description"),
    "icon": "defilement",
    "attributes": {
      "disabled": hostId !== user.id,
      "id": "defilement"
    },
    "options": [
      {
        "label": t("automatic"),
        "value": "auto",
        "selected": true
      },
      {
        "label": t("manual"),
        "value": "manual",
        "selected": false
      }
    ]
  }
]);
const teams = ref([]);
const maxPlayersInTeam = ref(4);

provide("maxPlayers", maxPlayersInTeam);

async function getPartyConfigurations() {
  const response = await fetch(`${env.VITE_URL}/api/parties/party-configurations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify({
      party_id: partyId,
      socket_id: socket.id,
      user_id: user.id,
    }),
  });

  if (response.ok) {
    const partyConfigurations = await response.json();
    numberTeamsSelect.forEach((option) => {
      if (option.value === partyConfigurations.teams.length) {
        option.selected = true;
      } else {
        option.selected = false;
      }
    });
    teams.value = partyConfigurations.teams;

    if(partyConfigurations.teams.length === 2) {
      maxPlayersInTeam.value = 8;
    } else if(partyConfigurations.teams.length === 3) {
      maxPlayersInTeam.value = 6;
    }
  } else {
    await router.push({ path: '/' });
  }
}

async function playerJoinTeam(teamId) {
  const response = await fetch(`${env.VITE_URL}/api/teams/join-team`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify({
      party_id: partyId,
      socket_id: socket.id,
      user_id: user.id,
      team_id: teamId,
    }),
  });

  if (response.ok) {
    const json = await response.json();
    teams.value.forEach((team) => {
      const playerIndex = team.players.findIndex((player) => player.id === json.user.id);
      if (playerIndex !== -1) {
        team.players.splice(playerIndex, 1);
      }
      if (team.id === json.team.id) {
        team.players.push(json.user);
      }
    });
  }
}

async function playerLeaveTeam(teamId) {
  const response = await fetch(`${env.VITE_URL}/api/teams/leave-team`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify({
      party_id: partyId,
      socket_id: socket.id,
      user_id: user.id,
      team_id: teamId,
    }),
  });

  if (response.ok) {
    const json = await response.json();
    teams.value.forEach((team) => {
      if (team.id === json.team.id) {
        const playerIndex = team.players.findIndex((player) => player.id === json.user.id);
        if (playerIndex !== -1) {
          team.players.splice(playerIndex, 1);
        }
      }
    });
  }
}

function removePlayerFromTeam(oldTeam, player) {
  teams.value.forEach((team) => {
    if (team.id === oldTeam.id) {
      const playerIndex = team.players.findIndex((p) => p.id === player.id);
      if (playerIndex !== -1) {
        team.players.splice(playerIndex, 1);
      }
    }
  });
}

async function randomTeams() {
  const response = await fetch(`${env.VITE_URL}/api/teams/random-teams`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify({
      party_id: partyId,
      socket_id: socket.id,
      user_id: user.id,
    }),
  });

  if (response.ok) {
    const json = await response.json();
    teams.value = json.teams;
  }
}

async function updateConfiguration(configurationId, value) {
  let body = {
    party_id: partyId,
    socket_id: socket.id,
    user_id: user.id,
  }

  if(configurationId === "drawing-time") {
    body.drawing_time = parseInt(value);
  } else if(configurationId === "voting-time") {
    body.voting_time = parseFloat(value);
  } else if(configurationId === "defilement") {
    body.defilement = value;
  }

  const response = await fetch(`${env.VITE_URL}/api/parties/update-configuration`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": userStore.language,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    const json = await response.json();
    const configuration = json.configuration

    if(configuration.drawing_time) {
      configurations[0].options.forEach((option) => {
        option.selected = option.value === configuration.drawing_time;
      });
    } else if(configuration.voting_time) {
      configurations[1].options.forEach((option) => {
        option.selected = option.value === configuration.voting_time;
      });
    } else if(configuration.defilement) {
      configurations[2].options.forEach((option) => {
        option.selected = option.value === configuration.defilement;
      });
    }
  }
}

onMounted(() => {
  getPartyConfigurations();

  socket.on("join-team", (newTeam, playerJoining) => {
    if(playerJoining.id === user.id) {
      return;
    }

    teams.value.forEach((team) => {
      const playerIndex =
        team.players.findIndex((player) => player.id === playerJoining.id);

      if (playerIndex !== -1) {
        team.players.splice(playerIndex, 1);
      }

      if (team.id === newTeam.id) {
        team.players.push(playerJoining);
      }
    });
  });

  socket.on("leave-team", (oldTeam, playerLeaving) => {
    if(playerLeaving.id === user.id) {
      return;
    }

    removePlayerFromTeam(oldTeam, playerLeaving);
  });

  socket.on("leave-party", (playerLeaving) => {
    teams.value.forEach((team) => {
      const playerIndex = team.players.findIndex((player) => player.id === playerLeaving.id);
      if (playerIndex !== -1) {
        team.players.splice(playerIndex, 1);
      }
    });
  });

  socket.on("random-teams", (newTeams) => {
    if(hostId !== user.id) {
      teams.value = newTeams;
    }
  });

  socket.on("update-configuration", (configuration) => {
    if(hostId !== user.id) {
      if(configuration.drawing_time) {
        configurations[0].options.forEach((option) => {
          option.selected = option.value === configuration.drawing_time;
        });
      } else if(configuration.voting_time) {
        configurations[1].options.forEach((option) => {
          option.selected = option.value === configuration.voting_time;
        });
      } else if(configuration.defilement) {
        configurations[2].options.forEach((option) => {
          option.selected = option.value === configuration.defilement;
        });
      }
    }
  });
})
</script>

<template>
  <main class="creating-teams">
    <h1 class="hidden-title">{{ t('creating_teams') }}</h1>
    <div class="creating-teams__container">
      <Configurations
        :numberTeamsSelect="numberTeamsSelect"
        :configurations="configurations"
        @randomTeams="randomTeams"
        @change="updateConfiguration"
      />
      <Settings />
      <div class="teams-panel">
        <Teams
          :teams="teams"
          @joinTeam="playerJoinTeam"
          @leaveTeam="playerLeaveTeam"
        />
        <div class="teams-panel__actions">
          <CopyLink />
          <Button
            type="primary"
            v-if="hostId === user.id"
          >
            <Icon icon="play" type="button" />
            {{ t("start_game") }}
          </Button>
        </div>
      </div>
    </div>
  </main>
</template>