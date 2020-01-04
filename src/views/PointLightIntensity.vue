<template>
  <div>
    <h1>Light intensity visualization</h1>
    <div class="content">
      <heat-map
        class="heat-map"
        :areaIntensityData="areaIntensityData"
        :width="measurementArea.xLength"
        :height="measurementArea.yLength"
        :pointsPerLengthCount="measurementArea.pointsPerLengthCount"
      >
      </heat-map>

      <div class="range">
        Cut on:
        <range-slider
          :min="0"
          :max="measurementArea.yLength"
          v-model="currentCutY"
        >
        </range-slider>
        {{ currentCutY }}
      </div>

      <la-cartesian
        :bound="[0, maxIntensity]"
        :data="areaCutIntensityData"
        :width="600"
      >
        <la-area prop="intensity"></la-area>
      </la-cartesian>
    </div>
  </div>
</template>

<script>
import { times, sumBy, flatten, max, map } from "lodash";
import { Cartesian, Area } from "laue";
import RangeSlider from "vue-range-slider";
import "vue-range-slider/dist/vue-range-slider.css";

import HeatMap from "../components/HeatMap";

const radianToDegree = radian => (radian * 180) / Math.PI;
// const degreeToRadian = degree => (Math.PI * degree) / 180;

const getRectangularTriangleTopAngle = (width, height) =>
  radianToDegree(Math.atan(width / height));

const getRectangularTriangleDiagonalsLength = (width, height) =>
  Math.sqrt(width * width + height * height);

const getMeasurementPointIntensity = (
  { measurementX, measurementY, areaPointsCount, height },
  { intensity, flowWidthAngle, x, y }
) => {
  const measurementToLightPointXLength = Math.abs(measurementX - x);
  const measurementToLightPointYLength = Math.abs(measurementY - y);
  const measurementToLightPointOnSquareLength = getRectangularTriangleDiagonalsLength(
    measurementToLightPointXLength,
    measurementToLightPointYLength
  );
  const measurementAndLightPointAngle = getRectangularTriangleTopAngle(
    measurementToLightPointOnSquareLength,
    height
  );

  if (measurementAndLightPointAngle > flowWidthAngle / 2) {
    return 0;
  }

  const measurementToLightPointLength = getRectangularTriangleDiagonalsLength(
    measurementToLightPointOnSquareLength,
    height
  );

  // TODO враховувати відзеркалення
  return (
    intensity / (areaPointsCount * Math.pow(measurementToLightPointLength, 2))
  );
};

export default {
  name: "PointLightIntensity",
  components: {
    LaCartesian: Cartesian,
    LaArea: Area,
    RangeSlider,
    HeatMap
  },

  data: () => ({
    lightPoints: [
      {
        x: 10,
        y: 50,
        flowWidthAngle: 120,
        intensity: 1
      },
      {
        x: 120,
        y: 50,
        flowWidthAngle: 120,
        intensity: 1
      },
      {
        x: 140,
        y: 50,
        flowWidthAngle: 120,
        intensity: 1
      }
    ],
    measurementArea: {
      xLength: 200,
      yLength: 100,
      height: 10,
      pointsPerLengthCount: 3
    },
    currentCutY: 50
  }),
  computed: {
    areaIntensityData() {
      const {
        pointsPerLengthCount,
        xLength,
        yLength,
        height
      } = this.measurementArea;
      const xPointsCount = xLength * pointsPerLengthCount;
      const yPointsCount = yLength * pointsPerLengthCount;
      const areaPointsCount = xPointsCount * yPointsCount;

      return flatten(
        times(yPointsCount, measurementYPointIndex =>
          times(xPointsCount, measurementXPointIndex => {
            const measurementX = measurementXPointIndex / pointsPerLengthCount;
            const measurementY = measurementYPointIndex / pointsPerLengthCount;

            const measurementIntensity = sumBy(this.lightPoints, lightPoint =>
              getMeasurementPointIntensity(
                {
                  measurementX,
                  measurementY,
                  areaPointsCount,
                  height
                },
                lightPoint
              )
            );

            return {
              x: measurementX,
              y: measurementY,
              intensity: measurementIntensity
            };
          })
        )
      );
    },

    areaCutIntensityData() {
      return this.areaIntensityData.filter(({ y }) => y === this.currentCutY);
    },

    maxIntensity() {
      return max(map(this.areaIntensityData, "intensity"));
    }
  }
};
</script>

<style>
.content {
  width: 600px;
  margin: 0 auto;
}

.heat-map {
  width: 100%;
}

.range {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
