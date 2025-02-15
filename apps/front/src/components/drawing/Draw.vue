<script setup>
import "../../assets/css/components/drawing/_draw.scss";
import Board from "./Board.vue";
import Timer from "./Timer.vue";
import Tools from "./Tools.vue";
import { reactive, ref } from "vue";
import Palette from "./Palette.vue";
import Thicknesses from "./Thicknesses.vue";
import Opacity from "./Opacity.vue";

defineProps({
  mouseMoving: {
    type: Object,
    default: null,
  },
});

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
    name: "paint-pot",
    icon: "paint-pot",
    selected: false,
  },
  {
    name: "line",
    icon: "line",
    selected: false,
  },
  {
    name: "empty-rectangle",
    icon: "empty-rectangle",
    selected: false,
  },
  {
    name: "rectangle",
    icon: "rectangle",
    selected: false,
  },
  {
    name: "empty-ellipse",
    icon: "empty-ellipse",
    selected: false,
  },
  {
    name: "ellipse",
    icon: "ellipse",
    selected: false,
  },
]);
const colors = reactive([
  {
    name: "gray",
    value: "#807978",
    selected: false,
  },
  {
    name: "black",
    value: "#1A120F",
    selected: true,
  },
  {
    name: "beige",
    value: "#FF9066",
    selected: false,
  },
  {
    name: "text",
    value: "#FDF1ED",
    selected: false,
  },
  {
    name: "dark-blue",
    value: "#2852EB",
    selected: false,
  },
  {
    name: "blue",
    value: "#28B4EB",
    selected: false,
  },
  {
    name: "dark-red-2",
    value: "#B20000",
    selected: false,
  },
  {
    name: "red",
    value: "#E22929",
    selected: false,
  },
  {
    name: "dark-yellow",
    value: "#B2931E",
    selected: false,
  },
  {
    name: "yellow",
    value: "#EBC128",
    selected: false,
  },
  {
    name: "dark-orange",
    value: "#A73509",
    selected: false,
  },
  {
    name: "orange",
    value: "#EB5E28",
    selected: false,
  },
  {
    name: "dark-green",
    value: "#0F590F",
    selected: false,
  },
  {
    name: "green",
    value: "#21BF21",
    selected: false,
  },
  {
    name: "purple",
    value: "#792BFF",
    selected: false,
  },
  {
    name: "pink",
    value: "#EB2870",
    selected: false,
  },
]);
const customColor = reactive({
  name: "custom",
  value: "#000000",
  selected: false,
});
const thicknesses = reactive([
  {
    value: 4,
    selected: false,
  },
  {
    value: 8,
    selected: true,
  },
  {
    value: 12,
    selected: false,
  },
  {
    value: 16,
    selected: false,
  },
  {
    value: 24,
    selected: false,
  },
]);
const opacityAttributes = reactive({
  min: 20,
  max: 100,
  step: 1,
  value: 100,
});
const strokeStyle = ref("#1A120F");
const lineWidth = ref(8);
const opacity = ref(100);

function updateColor(color) {
  if (color.name === "custom") {
    customColor.value = color.value || "#000000";
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

  strokeStyle.value = color.value;
}

function updateTool(tool) {
  tools.forEach((t) => {
    t.selected = t.name === tool;
  });
}

function updateThickness(thickness) {
  thicknesses.forEach((t) => {
    t.selected = t.value === thickness;
  });
  lineWidth.value = thickness;
}

function updateOpacity(value) {
  opacityAttributes.value = value;
  opacity.value = value;
}
</script>

<template>
  <div class="draw">
    <Palette
      :colors="colors"
      :customColor="customColor"
      @selectColor="updateColor"
    />
    <div class="draw__middle">
      <Board
        :mouseMoving="mouseMoving"
        :strokeStyle="strokeStyle"
        :lineWidth="lineWidth"
      />

      <div class="draw__footer">
        <Thicknesses
          :thicknesses="thicknesses"
          @selectThickness="updateThickness"
        />
        <Opacity
          :attributes="opacityAttributes"
          @selectOpacity="updateOpacity"
        />
      </div>
    </div>
    <Tools :tools="tools" @selectTool="updateTool" />
    <Timer />
  </div>
</template>
