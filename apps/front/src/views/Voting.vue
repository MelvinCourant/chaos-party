<script setup>
import '../assets/css/views/_voting.scss';
import Settings from '../components/inputs/Settings.vue';
import { useI18n } from 'vue-i18n';
import TeamDraw from '../components/voting/TeamDraw.vue';
import { useUserStore } from '../stores/user.js';
import { usePartyStore } from '../stores/party.js';
import { useSocketStore } from '../stores/socket.js';
import { onMounted, provide, reactive, ref, watch } from 'vue';
import Loading from '../components/voting/Loading.vue';
import { useRouter } from 'vue-router';
import Votes from '../components/voting/Votes.vue';
import Timer from '../components/utils/Timer.vue';
import VotingPlayers from '../components/voting/VotingPlayers.vue';
import SaboteurReveal from '../components/voting/SaboteurReveal.vue';
import Scores from '../components/utils/Scores.vue';

const { t } = useI18n();
const env = import.meta.env;
const userStore = useUserStore();
const user = userStore.user;
const partyStore = usePartyStore();
const partyId = partyStore.partyId;
const hostId = ref(partyStore.hostId);
const { socket } = useSocketStore();
const router = useRouter();
const mission = ref('');
const numberTeam = ref(1);
const team = ref({});
const step = ref(1);
const votes = ref([]);
const previousNotesSelected = ref([]);
const votingDuration = ref(1);
const defilement = ref(null);
const timer = ref(0);
const elapsed = ref(0);
const disabledVote = ref(false);
const votingPlayers = reactive({
  title: '',
  type: '',
});
const saboteurVotes = ref([]);
const saboteurReveal = reactive({
  title: t('the_saboteur_was'),
  player: {
    pseudo: '',
    image: '',
    saboteur_revealed: false,
  },
});
let interval = null;

provide('duration', votingDuration);
provide('elapsed', elapsed);

async function getVoting() {
  const response = await fetch(`${env.VITE_URL}/api/parties/voting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': userStore.language,
    },
    body: JSON.stringify({
      socket_id: socket.id,
      user_id: user.id,
      party_id: partyId,
      number_team: numberTeam.value,
    }),
  });

  if (response.ok) {
    const json = await response.json();

    votingDuration.value = parseFloat(json.party.voting_time);
    defilement.value = json.party.defilement;
    mission.value = json.mission;
    team.value = json.team;

    const playerIsOnTeam = team.value.players.some(
      (player) => player.id === user.id,
    );

    if (playerIsOnTeam) {
      disabledVote.value = true;
    }

    socket.emit('voting-player-ready', {
      party_id: partyId,
    });
  } else {
    await router.push({ path: '/' });
  }
}

function nextStep() {
  if (
    step.value !== 1 &&
    step.value !== 4 &&
    step.value !== 5 &&
    step.value !== 6
  ) {
    socket.emit('next-step', {
      party_id: partyId,
      socket_id: socket.id,
    });
  }
}

function selectNote({ vote_id, note }) {
  const vote = votes.value.find((v) => v.id === vote_id);

  vote.notes.forEach((n) => {
    if (
      previousNotesSelected.value.some(
        ([id, note]) => id === vote_id && note === n.note,
      )
    ) {
      n.quantity--;
      previousNotesSelected.value = previousNotesSelected.value.filter(
        ([id, note]) => id !== vote_id || note !== n.note,
      );
    }

    if (n.note === note.note) {
      n.quantity++;
      n.selected = !n.selected;
    } else {
      n.selected = false;
    }
  });

  previousNotesSelected.value.push([vote_id, note.note]);

  const maxQuantity = Math.max(...vote.notes.map((n) => n.quantity));
  vote.notes.forEach((n) => {
    n.most_voted = n.quantity === maxQuantity;
  });

  socket.emit('player-vote', {
    party_id: partyId,
    socket_id: socket.id,
    vote_id,
    note: note.note.toString(),
  });
}

function startTimer() {
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => {
    timer.value += 100;
  }, 100);
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
  timer.value = 0;
}

function updateSaboteurVotes(playerId, user) {
  const saboteurTargeted = saboteurVotes.value.find(
    (vote) => vote.player_id === playerId,
  );

  const existingVote = saboteurVotes.value.find((vote) =>
    vote.votes.some((v) => v.user_id === user.id),
  );

  if (existingVote) {
    existingVote.votes = existingVote.votes.filter(
      (v) => v.user_id !== user.id,
    );
  }

  if (saboteurTargeted) {
    saboteurTargeted.votes.push({
      user_id: user.id,
      user_image: user.image,
    });
  } else {
    saboteurVotes.value.push({
      player_id: playerId,
      votes: [
        {
          user_id: user.id,
          user_image: user.image,
        },
      ],
    });
  }
}

function votingToSaboteur(playerId) {
  updateSaboteurVotes(playerId, {
    id: user.id,
    image: user.image,
  });

  socket.emit('player-vote-saboteur', {
    party_id: partyId,
    socket_id: socket.id,
    player_id: playerId,
    user_id: user.id,
    user_image: user.image,
  });
}

watch(timer, (value) => {
  const maxTime = votingDuration.value * 60 * 1000;

  if (value >= maxTime) {
    stopTimer();

    socket.emit('timer-finished', {
      party_id: partyId,
    });

    step.value++;
  }
});

onMounted(() => {
  socket.on('all-draws-saved', async () => {
    await getVoting();
  });

  socket.on('voting-start', () => {
    step.value = 2;
  });

  socket.on('next-step', () => {
    step.value++;
  });

  socket.on('votes', (data) => {
    votes.value = data.votes;
    votes.value.forEach((vote) => {
      vote.notes.forEach((note) => {
        note.selected = false;
      });
    });
    previousNotesSelected.value = [];
  });

  socket.on('player-vote', (data) => {
    if (data.socket_id === socket.id) return;

    const vote = votes.value.find((v) => v.id === data.vote_id);

    vote.notes.forEach((n) => {
      if (n.note === data.new_note) {
        n.quantity++;
      } else if (n.note === data.previous_note && n.quantity > 0) {
        n.quantity--;
      }
    });

    const maxQuantity = Math.max(...vote.notes.map((n) => n.quantity));
    vote.notes.forEach((n) => {
      n.most_voted = n.quantity === maxQuantity;
    });
  });

  socket.on('start-timer', startTimer);

  socket.on('timer-state', (data) => {
    if (socket.id === data.socket_id) return;

    if (data.timer !== 0) {
      timer.value = data.timer;
      elapsed.value = data.timer;
      startTimer();
    }
  });

  socket.on('player-sabotage', (data) => {
    votingPlayers.title = data.title;
    votingPlayers.type = data.type;
  });

  socket.on('player-vote-saboteur', (data) => {
    if (data.socket_id === socket.id) return;

    updateSaboteurVotes(data.player_id, {
      id: data.user_id,
      image: data.user_image,
    });
  });

  socket.on('team-result', (data) => {
    saboteurReveal.player = {
      pseudo: data.saboteur.pseudo,
      image: data.saboteur.image || '',
      saboteur_revealed: data.saboteur_revealed,
    };
    team.value.players = data.players;
  });
});

watch(step, (value) => {
  if (defilement.value === 'auto') {
    if (value === 2 || value === 3) {
      setTimeout(() => {
        socket.emit('next-step', {
          party_id: partyId,
          socket_id: socket.id,
        });
      }, 2000);
    }
  }

  if (user.id === hostId.value) {
    if (value === 4) {
      socket.emit('step-voting', {
        party_id: partyId,
        socket_id: socket.id,
        team_id: team.value.id,
        step: 'mission',
        locale: userStore.language,
      });
    }

    if (value === 5 || value === 7) {
      const votesCleaned = votes.value.map((vote) => {
        return {
          id: vote.id,
          team_id: vote.team_id,
          user_id: vote.user_id,
          notes: vote.notes.map((note) => {
            return {
              note: note.note,
              quantity: note.quantity,
            };
          }),
        };
      });

      if (value === 5) {
        socket.emit('step-voting', {
          party_id: partyId,
          socket_id: socket.id,
          team_id: team.value.id,
          step: 'sabotage',
          locale: userStore.language,
          votes: votesCleaned,
        });
      } else {
        socket.emit('step-voting', {
          party_id: partyId,
          socket_id: socket.id,
          team_id: team.value.id,
          step: 'team-result',
          locale: userStore.language,
          votes: votesCleaned,
        });
      }
    }

    if (value === 6) {
      socket.emit('step-voting', {
        party_id: partyId,
        socket_id: socket.id,
        team_id: team.value.id,
        step: 'objectives',
        locale: userStore.language,
        votes: saboteurVotes.value,
      });
    }
  }

  if (value >= 5 && value <= 7) {
    disabledVote.value = !disabledVote.value;
  }
});
</script>

<template>
  <main
    ref="voting"
    :class="['voting', `voting--step-${step}`]"
    @click.stop="
      () => {
        if (defilement === 'manual' && user.id === hostId) {
          nextStep();
        }
      }
    "
  >
    <h1 class="hidden-title">{{ t('voting') }}</h1>
    <Loading v-show="step === 1" />
    <TeamDraw
      v-show="step > 1"
      :step="step"
      :mission="mission"
      :number-team="numberTeam"
      :img-src="team.draw"
    />
    <div class="voting__votes" v-if="step >= 4">
      <Timer
        v-if="step >= 4 && step <= 6"
        :key="step"
        :duration="votingDuration"
        :elapsed="elapsed"
      />
      <Votes
        :key="step"
        :votes="votes"
        :disabled="disabledVote"
        v-if="step === 4 || step === 6"
        @noteSelected="selectNote"
      />
      <VotingPlayers
        :title="votingPlayers.title"
        :type="votingPlayers.type"
        :players="team.players"
        :disabled="disabledVote"
        :saboteurVotes="saboteurVotes"
        @playerSelected="votingToSaboteur"
        v-if="step === 5"
      />
      <SaboteurReveal :saboteurReveal="saboteurReveal" v-if="step === 7" />
      <Scores title="Scores" :players="team.players" v-if="step === 7" />
    </div>
    <Settings />
  </main>
</template>
