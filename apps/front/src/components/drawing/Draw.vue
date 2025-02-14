<script setup>
import '../../assets/css/components/drawing/_draw.scss';
import Board from "./Board.vue";
import Timer from "./Timer.vue";
import Tools from "./Tools.vue";
import {ref} from "vue";

defineEmits(['selectTool']);

const tools = ref([
  {
    name: "pen",
    icon: "pen",
    selected: true,
  },
  {
    name: "rubber",
    icon: "rubber",
    selected: false,
  },
  {
    name: 'paint-pot',
    icon: 'paint-pot',
    selected: false,
  },
  {
    name: 'line',
    icon: 'line',
    selected: false,
  },
  {
    name: 'empty-rectangle',
    icon: 'empty-rectangle',
    selected: false,
  },
  {
    name: 'rectangle',
    icon: 'rectangle',
    selected: false,
  },
  {
    name: 'empty-ellipse',
    icon: 'empty-ellipse',
    selected: false,
  },
  {
    name: 'ellipse',
    icon: 'ellipse',
    selected: false,
  },
]);

function updateTool(tool) {
  tools.value.forEach((t) => {
    t.selected = t.name === tool;
  });
}
</script>

<template>
  <div class="draw">
    <Board />
    <Tools
      :tools="tools"
      @selectTool="updateTool"
    />
    <Timer/>
  </div>
</template>