import Vue from "vue";
import VueDragDrop from "vue-drag-drop";

import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

Vue.use(VueDragDrop);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
