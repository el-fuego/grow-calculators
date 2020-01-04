<template>
  <canvas
    ref="canvas"
    :width="width * pointsPerLengthCount"
    :height="height * pointsPerLengthCount"
  ></canvas>
</template>

<script>
import { min, max, map } from "lodash";

const setPixel = (imageData, x, y, r, g, b, a) => {
  const index = (x + y * imageData.width) * 4;
  imageData.data[index] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
};

export default {
  name: "HeatMap",
  props: {
    areaIntensityData: Array,
    width: Number,
    height: Number,
    pointsPerLengthCount: Number
  },
  computed: {
    maxIntensity() {
      return max(map(this.areaIntensityData, "intensity"));
    },
    minIntensity() {
      return min(map(this.areaIntensityData, "intensity"));
    }
  },
  mounted() {
    this.draw();
  },
  methods: {
    draw() {
      const ctx = this.$refs.canvas.getContext("2d");
      const canvasWidth = this.$refs.canvas.width;
      const canvasHeight = this.$refs.canvas.height;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

      this.areaIntensityData.forEach(({ x, y, intensity }) =>
        setPixel(
          imageData,
          x * this.pointsPerLengthCount,
          y * this.pointsPerLengthCount,
          255,
          0,
          0,
          (255 * (this.minIntensity + intensity)) / this.maxIntensity
        )
      );

      ctx.putImageData(imageData, 0, 0);
    }
  }
};
</script>
