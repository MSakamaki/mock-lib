

const HOST = 'http://localhost:3030';

/** メーカーモデルのAPI */
export class DebugApisAPI {

  async get() {
    return fetch(`${HOST}/debug/apis`)
      .then(r => r.json() as Promise<string[]>);
  }

  async getState(api: string) {
    return fetch(`${HOST}/debug/${api}`)
      .then(r => r.json()) as Promise<ApiState>;
  }

  async putState(prefix:string, url:string, wait:number, status:number, data:any ) {
    console.log(prefix);
    return fetch(`/debug/${prefix ? `${prefix}/` : '' }${url}`, {
      method: 'PUT',
      body: JSON.stringify({
        wait: wait,
        status: status,
        data: data,
      }),
    }).then(res => res.json());
  }
}


export interface ApiState {
  id: string;
  prefix: string;
  name: string;
  status: number;
  wait: number;
  data: any | any[];
} 