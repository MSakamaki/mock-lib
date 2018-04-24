import {
  GetterTree,
  MutationTree,
  ActionTree,
  Commit
} from 'vuex'

import { State, Getters, Actions } from './interface';
import { initSelect, initializeState } from './initialize';
import { DebugApisAPI, ApiState } from '../../../api/api.api';

const restApi = {
  apis: new DebugApisAPI(),
};

const getters: GetterTree<Getters, State> = {
  apis: state => {
    return state.apis;
  },
  states: state => {
    return state.states;
  },
  select: state => {
    return state.states.find(s => s.id === state.selectId) || initSelect;
  },
  selectId: state => {
    return state.selectId;
  }
};

const mutations: MutationTree<State> = {
  getApis(state, payload) {
    state.apis = payload.apis;
  },
  setApiStates(state, payload) {
    state.states = payload.states;
  },
  selected(state, payload) {
    state.selectId = payload.select;
  }
};

const actions: ActionTree<Actions, State> = {

  getApis({ commit }, _payload) {
    getAllApis(commit);
  },

  selected({ commit }, payload) {
    commit('selected', {
      select: payload.select,
    });
  },

  updateWait({ getters, commit }, { wait }) {
    const api = (<Getters>getters).select;
    if (api) {
      restApi.apis.putState(api.id, wait, api.status, api.data)
        .then(()=> getAllApis(commit));
    }
  },

  updateState({ getters, commit }, { status }) {
    const api = (<Getters>getters).select;
    if (api) {
      restApi.apis.putState(api.id, api.wait, status, api.data)
        .then(()=> getAllApis(commit));
    }
  },
  updateData({ getters, commit }, { data }) {
    const api = (<Getters>getters).select;
    if (api) {
      restApi.apis.putState(api.id, api.wait, api.status, data)
        .then(()=> getAllApis(commit));
    }
  },
};

const getAllApis  = (commit: Commit) => restApi.apis.get().then((apis: string[])=> {
  commit('getApis', {
    apis: apis,
  });

  Promise.all(apis.map(api => restApi.apis.getState(api) ))
    .then((states: ApiState[]) => {
      
      commit('setApiStates', {
        states: states,
      });
    })
});

export const api = {
  namespaced: true,
  state: initializeState,
  getters: getters,
  mutations: mutations,
  actions: actions
};