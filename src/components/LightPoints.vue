<template>
  <drop class="light-points-container" @drop="moveLightPoint">
    <drag
      v-for="lightPoint in value"
      :key="`${lightPoint.x},${lightPoint.y}`"
      :transfer-data="lightPoint.id"
      :class="['light-point', selectedLightPoint === lightPoint && 'selected']"
      :title="
        `x:${lightPoint.x}, y:${lightPoint.y}, intensity: ${lightPoint.intensity}, angle: ${lightPoint.flowWidthAngle}`
      "
      :style="
        `left: ${lightPoint.x * pointsPerLengthCount}px; top: ${lightPoint.y *
          pointsPerLengthCount}px;`
      "
      ><div @click.stop="$emit('click', lightPoint)"></div
    ></drag>
  </drop>
</template>

<script>
export default {
  name: "LightPoints",
  props: {
    value: Array,
    selectedLightPoint: Object,
    pointsPerLengthCount: Number
  },
  methods: {
    moveLightPoint(id, event) {
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

<style scoped>
.light-point {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  visibility: hidden;
  opacity: 0;
  background-color: blueviolet;
  cursor: pointer;
  transition: visibility 0.3s, opacity 0.3s;
}

.light-point.selected {
  opacity: 1;
  visibility: visible;
}

.light-point div {
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 10px;
}

.light-points-container:hover .light-point {
  opacity: 1;
  visibility: visible;
}
</style>
