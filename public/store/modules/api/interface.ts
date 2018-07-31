import { ApiState } from "../../../api/api.api";

export interface State {
  apis: string[];
  states: ApiState[];
  selectId: string;
  prefix: string;
}

export interface Getters {
  apis: string[];
  states: ApiState[],
  select: ApiState;
  selectId: string;
  prefix: string;
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
