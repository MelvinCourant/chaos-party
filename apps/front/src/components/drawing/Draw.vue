<script setup>
import '../../assets/css/components/drawing/_draw.scss';
import Board from "./Board.vue";
import Timer from "./Timer.vue";
import Tools from "./Tools.vue";
import {reactive, ref} from "vue";
import Palette from "./Palette.vue";

defineEmits(['selectTool']);

const tools = reactive([
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
const colors = reactive([
  {
    name: 'gray',
    selected: false,
  },
  {
    name: 'black',
    selected: true,
  },
  {
    name: 'beige',
    selected: false,
  },
  {
    name: 'text',
    selected: false,
  },
  {
    name: 'dark-blue',
    selected: false,
  },
  {
    name: 'blue',
    selected: false,
  },
  {
    name: 'dark-red-2',
    selected: false,
  },
  {
    name: 'red',
    selected: false,
  },
  {
    name: 'dark-yellow',
    selected: false,
  },
  {
    name: 'yellow',
    selected: false,
  },
  {
    name: 'dark-orange',
    selected: false,
  },
  {
    name: 'orange',
    selected: false,
  },
  {
    name: 'dark-green',
    selected: false,
  },
  {
    name: 'green',
    selected: false,
  },
  {
    name: 'purple',
    selected: false,
  },
  {
    name: 'pink',
    selected: false,
  }
]);
const customColor = reactive({
  name: 'custom',
  value: '#000000',
  selected: false,
});

function updateColor(color) {
  if(color.name === 'custom') {
    color.value = color.value || '#000000';
    customColor.selected = true;

    colors.forEach((c) => {
      c.selected = false;
    });
  } else {
    colors.forEach((c) => {
      c.selected = c.name === color.name;
    });
    customColor.selected = false;
  }
}

function updateTool(tool) {
  tools.forEach((t) => {
    t.selected = t.name === tool;
  });
}
</script>

<template>
  <div class="draw">
    <Palette
      :colors="colors"
      :customColor="customColor"
      @selectColor="updateColor"
    />
    <Board />
    <Tools
      :tools="tools"
      @selectTool="updateTool"
    />
    <Timer/>
  </div>
</template>