import Vue from 'vue'
import Vuex from 'vuex'
import { api } from './modules/api/';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    api,
  },
  strict: debug,
})