<template>
  <svg
    :viewBox="
      `0 0 ${width * pointsPerLengthCount} ${height * pointsPerLengthCount}`
    "
  >
    <polygon :points="points"></polygon>
  </svg>
</template>

<script>
export default {
  name: "Chart",
  props: {
    intensityData: Array,
    width: Number,
    height: Number,
    maxIntensity: Number,
    pointsPerLengthCount: Number
  },
  computed: {
    points() {
      const height = this.pointsPerLengthCount * this.height;

      if (!this.intensityData || !this.intensityData.length) {
        return `0,${height} 0,${height}`;
      }

      const lineData = this.intensityData.map(({ x, intensity }) =>
        [
          x * this.pointsPerLengthCount,
          height * (1 - intensity / this.maxIntensity)
        ].join(",")
      );

      return `0,${height} ${lineData.join(" ")} ${
        lineData[lineData.length - 1].split(",")[0]
      },${height}`;
    }
  }
};
</script>
