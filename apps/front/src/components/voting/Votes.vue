<script setup>
import '../../assets/css/components/voting/_votes.scss';
import NoteButton from './NoteButton.vue';

defineProps({
  votes: {
    type: Array,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['noteSelected']);
</script>

<template>
  <ul class="votes">
    <li v-for="vote in votes" :key="vote.id" class="vote">
      <h2 class="vote__title">{{ vote.title }}</h2>
      <ul class="vote__notes">
        <li v-for="note in vote.notes" :key="note.id" class="vote__note">
          <NoteButton
            :note="note.note"
            :isSelected="note.selected"
            :disabled="disabled"
            @click="$emit('noteSelected', { vote_id: vote.id, note: note })"
          />
          <span class="vote__quantity">{{ note.quantity }}</span>
        </li>
      </ul>
    </li>
  </ul>
</template>
