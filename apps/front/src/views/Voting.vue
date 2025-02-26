<script setup>
import '../assets/css/views/_voting.scss';
import Settings from '../components/inputs/Settings.vue';
import { useI18n } from 'vue-i18n';
import TeamDraw from '../components/voting/TeamDraw.vue';
import { useUserStore } from '../stores/user.js';
import { usePartyStore } from '../stores/party.js';
import { useSocketStore } from '../stores/socket.js';
import { onMounted, ref, watch } from 'vue';
import Loading from '../components/voting/Loading.vue';
import { useRouter } from 'vue-router';
import Votes from '../components/voting/Votes.vue';

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

    mission.value = json.mission;
    team.value = json.team;

    socket.emit('voting-player-ready', {
      party_id: partyId,
    });
  } else {
    await router.push({ path: '/' });
  }
}

getVoting();

function nextStep(e) {
  if (
    user.id === hostId.value &&
    step.value !== 1 &&
    step.value !== 4 &&
    !e.target.closest('.settings') &&
    !e.target.closest('.popin')
  ) {
    step.value++;

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

  socket.emit('player-vote', {
    party_id: partyId,
    socket_id: socket.id,
    vote_id,
    note: note.note.toString(),
  });
}

onMounted(() => {
  socket.on('voting-start', () => {
    step.value = 2;
  });

  socket.on('next-step', (data) => {
    if (socket.id === data.socket_id) return;

    step.value++;
  });

  socket.on('votes', (data) => {
    votes.value = data.votes;
    votes.value.forEach((vote) => {
      vote.notes.forEach((note) => {
        note.selected = false;
      });
    });
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
  });
});

watch(step, (value) => {
  if (value === 4) {
    socket.emit('step-voting', {
      party_id: partyId,
      team_id: team.value.id,
      step: 'mission',
      locale: userStore.language,
    });
  }
});
</script>

<template>
  <main
    ref="voting"
    :class="['voting', `voting--step-${step}`]"
    @click.stop="nextStep"
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
    <Votes
      :votes="votes"
      :notesSelected="notesSelected"
      v-if="votes.length > 0"
      @noteSelected="selectNote"
    />
    <Settings />
  </main>
</template>
