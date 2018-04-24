import { ApiState } from "../../../api/api.api";

export interface State {
  apis: string[];
  states: ApiState[];
  selectId: string;
}

export interface Getters {
  apis: string[];
  states: ApiState[],
  select: ApiState;
  selectId: string;
}

export interface Mutations {
  getApis: {}
  setApiStates: {}
  selected: {}
}

export interface Actions {
  getApis: {}
  onSelect: {}
  updateWait: {}
  updateState: {}
  updateData: {}
}
