import { State } from "./interface";
import { ApiState } from "../../../api/api.api";

export const initializeState: State = {
  apis: [],
  states: [],
  selectId: '',
  prefix: '',
};

export const initSelect: ApiState = {
  id: '',
  name: '',
  status: 0,
  wait: 0,
  data: {},
  prefix: '',
};
