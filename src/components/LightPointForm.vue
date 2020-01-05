<template>
  <form class="form" @click.stop @submit.prevent="updateLightPoint">
    <div class="form-row">
      <label>
        X:
      </label>
      <input name="x" type="number" v-model="x" />
    </div>

    <div class="form-row">
      <label>
        Y:
      </label>
      <input name="y" type="number" v-model="y" />
    </div>

    <div class="form-row">
      <label>
        Flow Angle:
      </label>
      <input name="flowWidthAngle" type="number" v-model="flowWidthAngle" />
    </div>

    <div class="form-row">
      <label>
        Intensity:
      </label>
      <input name="intensity" type="number" v-model="intensity" />
    </div>

    <button type="submit" class="button">Update</button>
  </form>
</template>

<script>
export default {
  name: "LightPointForm",
  props: {
    lightPoint: Object
  },
  data() {
    return { ...this.lightPoint };
  },
  methods: {
    updateLightPoint() {
      this.lightPoint.x = this.x;
      this.lightPoint.y = this.y;
      this.lightPoint.flowWidthAngle = this.flowWidthAngle;
      this.lightPoint.intensity = this.intensity;
    }
  }
};
</script>

<style scoped>
.form {
  background-color: #d3f1ff;
  padding: 10px 15px;
  border-radius: 3px;
}

.form-row {
  text-align: left;
  width: 200px;
  margin: 2px auto;
}

.form-row label {
  display: inline-block;
  width: 100px;
  font-size: 13px;
}

.form-row input {
  width: 100px;
  box-sizing: border-box;
  font-size: 13px;
}

.button {
  margin-top: 10px;
  font-size: 13px;
}
</style>
