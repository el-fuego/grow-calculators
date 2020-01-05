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
import { times, sumBy, min, max, map } from "lodash";
import RangeSlider from "vue-range-slider";
import "vue-range-slider/dist/vue-range-slider.css";

import Chart from "../components/Chart";
import HeatMap from "../components/HeatMap";
import LightPoints from "../components/LightPoints";

// const radianToDegree = radian => (radian * 180) / Math.PI;
const degreeToRadian = degree => (Math.PI * degree) / 180;

const getRectangularTriangleTopAngle = (width, height) =>
  Math.atan(width / height);

const getRectangularTriangleDiagonalsLength = (width, height) =>
  Math.sqrt(width * width + height * height);

const getRectangularTriangleBaseLength = (topAngle, height) =>
  Math.tan(topAngle) * height;

const getCircleSquare = radius => {
  return Math.PI * radius * radius;
};

const getMeasurementPointIntensity = (
  { measurementX, measurementY, height },
  { intensity, flowWidthHalfAngleRadian, x, y, lightPointRayCount }
) => {
  const measurementToLightPointXLength = Math.abs(measurementX - x);
  const measurementToLightPointYLength = Math.abs(measurementY - y);
  const measurementToLightPointOnSquareLength = getRectangularTriangleDiagonalsLength(
    measurementToLightPointXLength,
    measurementToLightPointYLength
  );
  const measurementAndLightPointAngleRadian = getRectangularTriangleTopAngle(
    measurementToLightPointOnSquareLength,
    height
  );

  if (measurementAndLightPointAngleRadian > flowWidthHalfAngleRadian) {
    return 0;
  }

  const measurementToLightPointLength = getRectangularTriangleDiagonalsLength(
    measurementToLightPointOnSquareLength,
    height
  );

  return (
    intensity /
    (lightPointRayCount *
      measurementToLightPointLength *
      measurementToLightPointLength)
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
      handler(lightPoints) {
        localStorage.setItem("lightPoints", JSON.stringify(lightPoints));
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
    lightPointsWithPreparedData() {
      const { pointsPerLengthCount, height } = this.measurementArea;

      return this.lightPoints.map(lightPoint => {
        const flowWidthHalfAngleRadian = degreeToRadian(
          lightPoint.flowWidthAngle / 2
        );
        const lightCircleRadius = getRectangularTriangleBaseLength(
          flowWidthHalfAngleRadian,
          height
        );
        const lightCircleSquare = getCircleSquare(lightCircleRadius);
        const lightPointRayCount = lightCircleSquare * pointsPerLengthCount;

        return {
          ...lightPoint,
          flowWidthHalfAngleRadian,
          lightCircleRadius,
          lightPointRayCount
        };
      });
    },

    mirroredArea() {
      const minX = min(
        this.lightPointsWithPreparedData.map(
          ({ lightCircleRadius, x }) => x - lightCircleRadius
        )
      );
      const maxX = max(
        this.lightPointsWithPreparedData.map(
          ({ lightCircleRadius, x }) => x + lightCircleRadius
        )
      );
      const minY = min(
        this.lightPointsWithPreparedData.map(
          ({ lightCircleRadius, y }) => y - lightCircleRadius
        )
      );
      const maxY = max(
        this.lightPointsWithPreparedData.map(
          ({ lightCircleRadius, y }) => y + lightCircleRadius
        )
      );

      return {
        minX,
        maxX,
        minY,
        maxY
      };
    },

    areaIntensityData() {
      const start = Date.now();
      const {
        pointsPerLengthCount,
        xLength,
        yLength,
        height,
        mirroringCoefficient
      } = this.measurementArea;
      const xPointsCount = xLength * pointsPerLengthCount;
      const yPointsCount = yLength * pointsPerLengthCount;
      const res = [];

      times(yPointsCount, measurementYPointIndex =>
        times(xPointsCount, measurementXPointIndex => {
          const measurementX = measurementXPointIndex / pointsPerLengthCount;
          const measurementY = measurementYPointIndex / pointsPerLengthCount;

          const measurementDirectIntensity = sumBy(
            this.lightPointsWithPreparedData,
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
            measurementPointCoordinates => {
              // Optimisation: return 0 if measurement point is out of lightening ??
              if (
                measurementPointCoordinates.measurementX <
                  this.mirroredArea.minX ||
                measurementPointCoordinates.measurementX >
                  this.mirroredArea.maxX ||
                measurementPointCoordinates.measurementY <
                  this.mirroredArea.minY ||
                measurementPointCoordinates.measurementY >
                  this.mirroredArea.maxY
              ) {
                return 0;
              }

              return (
                mirroringCoefficient *
                sumBy(this.lightPointsWithPreparedData, lightPoint =>
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
            }
          );

          res.push({
            x: measurementX,
            y: measurementY,
            intensity: measurementDirectIntensity + mirroredIntensity
          });
        })
      );

      console.log("areaIntensityData", Date.now() - start);
      return res;
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
