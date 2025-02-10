<script setup>
import '../../assets/css/components/creating_teams/_teams.scss';
import Team from "../utils/Team.vue";

defineProps({
  teams: {
    type: Array,
    required: true
  }
})

defineEmits(['joinTeam', 'leaveTeam'])
</script>

<template>
  <div class="teams">
    <Team
      v-for="team in teams"
      :team="team"
      :key="team.id"
      @joinTeam="$emit('joinTeam', $event)"
      @leaveTeam="$emit('leaveTeam', $event)"
    >
      {{ teams.length }}
    </Team>
  </div>
</template>