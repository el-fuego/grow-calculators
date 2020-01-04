<template>
  <div class="light-points-container">
    <div
      v-for="point in lightPoints"
      :key="`${point.x},${point.y}`"
      class="light-point"
      :style="
        `left: ${point.x * pointsPerLengthCount}px; top: ${point.y *
          pointsPerLengthCount}px;`
      "
    ></div>
  </div>
</template>

<script>
export default {
  name: "LightPoints",
  props: {
    lightPoints: Array,
    pointsPerLengthCount: Number
  }
};
</script>

<style>
.light-point {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: blueviolet;
  transform: translate(-50%, -50%);
  visibility: hidden;
  opacity: 0;
  transition: visibility 0.3s, opacity 0.3s;
}

.light-points-container:hover .light-point {
  opacity: 1;
  visibility: visible;
}
</style>
