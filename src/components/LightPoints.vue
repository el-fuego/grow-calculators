<template>
  <drop class="light-points-container" @drop="onDrop">
    <drag
      v-for="lightPoint in value"
      :key="`${lightPoint.x},${lightPoint.y}`"
      class="light-point"
      :transfer-data="lightPoint.id"
      :style="
        `left: ${lightPoint.x * pointsPerLengthCount}px; top: ${lightPoint.y *
          pointsPerLengthCount}px;`
      "
    ></drag>
  </drop>
</template>

<script>
export default {
  name: "LightPoints",
  props: {
    value: Array,
    pointsPerLengthCount: Number
  },
  methods: {
    onDrop(id, event) {
      if (
        event.offsetX / this.pointsPerLengthCount <= 0 ||
        event.offsetY / this.pointsPerLengthCount <= 0
      ) {
        return;
      }

      this.$emit(
        "input",
        this.value.map(lightPoint => {
          if (id !== lightPoint.id) {
            return lightPoint;
          }

          return {
            ...lightPoint,
            x: event.offsetX / this.pointsPerLengthCount,
            y: event.offsetY / this.pointsPerLengthCount
          };
        })
      );
    }
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
