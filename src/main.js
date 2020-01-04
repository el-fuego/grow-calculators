import Vue from "vue";
import { Laue } from "laue";

import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

Vue.use(Laue);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
