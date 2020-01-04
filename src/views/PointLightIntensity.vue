<template>
  <div>
    <h1>Light intensity visualization</h1>
    <div class="height-range">
      Height:
      <range-slider :min="0" :max="100" v-model="measurementArea.height">
      </range-slider>
      {{ measurementArea.height }}
    </div>

    <div class="content">
      <div class="heat-map-container">
        <heat-map
          class="heat-map"
          :areaIntensityData="areaIntensityData"
          :width="measurementArea.xLength"
          :height="measurementArea.yLength"
          :pointsPerLengthCount="measurementArea.pointsPerLengthCount"
        >
        </heat-map>

        <light-points
          class="light-points-container"
          v-model="lightPoints"
          :pointsPerLengthCount="measurementArea.pointsPerLengthCount"
        ></light-points>
      </div>

      <div class="cut-range">
        Cut on:
        <range-slider
          :min="0"
          :max="measurementArea.yLength"
          v-model="currentCutY"
        >
        </range-slider>
        {{ currentCutY }}
      </div>

      <chart
        class="cut-chart"
        :intensityData="areaCutIntensityData"
        :maxIntensity="maxIntensity"
        :width="measurementArea.xLength"
        :height="measurementArea.yLength"
        :pointsPerLengthCount="measurementArea.pointsPerLengthCount"
      ></chart>
    </div>
  </div>
</template>

<script>
import { times, sumBy, flatten, max, map } from "lodash";
import RangeSlider from "vue-range-slider";
import "vue-range-slider/dist/vue-range-slider.css";

import Chart from "../components/Chart";
import HeatMap from "../components/HeatMap";
import LightPoints from "../components/LightPoints";

const radianToDegree = radian => (radian * 180) / Math.PI;
const degreeToRadian = degree => (Math.PI * degree) / 180;

const getRectangularTriangleTopAngle = (width, height) =>
  radianToDegree(Math.atan(width / height));

const getRectangularTriangleDiagonalsLength = (width, height) =>
  Math.sqrt(width * width + height * height);

const getConeBaseSquare = (topAngle, height) =>
  Math.PI * Math.pow(Math.tan(degreeToRadian(topAngle / 2)) * height, 2);

const getMeasurementPointIntensity = (
  { measurementX, measurementY, pointsPerLengthCount, height },
  { intensity, flowWidthAngle, x, y }
) => {
  const lightPointRayCount =
    getConeBaseSquare(flowWidthAngle, height) * pointsPerLengthCount;
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

  return (
    intensity /
    (lightPointRayCount * Math.pow(measurementToLightPointLength, 2))
  );
};

export default {
  name: "PointLightIntensity",
  components: {
    LightPoints,
    Chart: Chart,
    RangeSlider,
    HeatMap
  },

  data: () => ({
    lightPoints: JSON.parse(localStorage.getItem("lightPoints") || "null") || [
      {
        id: Math.random(),
        x: 10,
        y: 10,
        flowWidthAngle: 120,
        intensity: 1
      },
      {
        id: Math.random(),
        x: 10,
        y: 90,
        flowWidthAngle: 120,
        intensity: 1
      },
      {
        id: Math.random(),
        x: 190,
        y: 10,
        flowWidthAngle: 120,
        intensity: 1
      },
      {
        id: Math.random(),
        x: 190,
        y: 90,
        flowWidthAngle: 120,
        intensity: 1
      },
      {
        id: Math.random(),
        x: 120,
        y: 50,
        flowWidthAngle: 120,
        intensity: 1
      },
      {
        id: Math.random(),
        x: 140,
        y: 50,
        flowWidthAngle: 120,
        intensity: 1
      }
    ],
    measurementArea: JSON.parse(
      localStorage.getItem("measurementArea") || "null"
    ) || {
      xLength: 200,
      yLength: 100,
      height: 10,
      pointsPerLengthCount: 2,
      mirroringCoefficient: 0.8
    },
    currentCutY: 50
  }),
  watch: {
    lightPoints: {
      handler(measurementArea) {
        localStorage.setItem("lightPoints", JSON.stringify(measurementArea));
      },
      deep: true
    },
    measurementArea: {
      handler(measurementArea) {
        localStorage.setItem(
          "measurementArea",
          JSON.stringify(measurementArea)
        );
      },
      deep: true
    }
  },
  computed: {
    areaIntensityData() {
      const {
        pointsPerLengthCount,
        xLength,
        yLength,
        height,
        mirroringCoefficient
      } = this.measurementArea;
      const xPointsCount = xLength * pointsPerLengthCount;
      const yPointsCount = yLength * pointsPerLengthCount;

      return flatten(
        times(yPointsCount, measurementYPointIndex =>
          times(xPointsCount, measurementXPointIndex => {
            const measurementX = measurementXPointIndex / pointsPerLengthCount;
            const measurementY = measurementYPointIndex / pointsPerLengthCount;

            const measurementDirectIntensity = sumBy(
              this.lightPoints,
              lightPoint =>
                getMeasurementPointIntensity(
                  {
                    measurementX,
                    measurementY,
                    pointsPerLengthCount,
                    height
                  },
                  lightPoint
                )
            );

            // TODO calculate multiple mirroring (use while)
            const mirroredIntensity = sumBy(
              [
                {
                  measurementX: -measurementX,
                  measurementY: measurementY
                },
                {
                  measurementX: measurementX,
                  measurementY: -measurementY
                },
                {
                  measurementX: xLength * 2 - measurementX,
                  measurementY: measurementY
                },
                {
                  measurementX: measurementX,
                  measurementY: yLength * 2 - measurementY
                }
              ],
              measurementPointCoordinates =>
                mirroringCoefficient *
                sumBy(this.lightPoints, lightPoint =>
                  getMeasurementPointIntensity(
                    {
                      ...measurementPointCoordinates,
                      pointsPerLengthCount,
                      height
                    },
                    lightPoint
                  )
                )
            );

            return {
              x: measurementX,
              y: measurementY,
              intensity: measurementDirectIntensity + mirroredIntensity
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

.heat-map-container {
  position: relative;
  display: inline-block;
  margin: 0 auto;
}

/*.cut-chart,*/
/*.heat-map {*/
/*width: 100%;*/
/*}*/

.cut-chart polygon {
  fill: blueviolet;
}

.light-points-container {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.height-range,
.cut-range {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px 0 20px 0;
}
</style>
