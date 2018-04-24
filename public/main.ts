import './main.css';
import Vue from 'vue';
import ElementUI from 'element-ui'
import VJsoneditor from 'vue-jsoneditor';

import 'jsoneditor/dist/jsoneditor.min.js';
import 'jsoneditor/dist/jsoneditor.css';

import 'element-ui/lib/theme-chalk/index.css'

import store from './store';
import AppComponent from './app/App.vue';

Vue.config.productionTip = false

Vue.use(ElementUI);
Vue.use(VJsoneditor);

new Vue({
  store,
  el: '#app',
  template: '<app-component/>',
  components: { AppComponent }
});
