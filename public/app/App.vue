<template>
  <el-container>
    <el-aside>
      <el-card class="menu-list-item"
        v-for="(state, index) in states"
        v-bind:value="state.id"
        v-bind:key='index'
        v-bind:class="{ active: state.id === select.id }"
        @click.native="onSelected(state.id)">
        <div class="menu-url">
          <span>
            <span class="menu-badge-left url"> URL </span>
            <span class="menu-badge-right"> {{ state.id }} </span>
          </span>
        </div>
        <div class="menu-head">
          <span>
            <span class="menu-badge-left" v-bind:class="{ warn: state.status !== 200 }"> STATUS </span>
            <span class="menu-badge-right"> {{ state.status }} </span>
          </span>
          <span>
            <span class="menu-badge-left" v-bind:class="{ warn: state.wait !== 0 }"> WAIT </span>
            <span class="menu-badge-right"> {{ state.wait / 1000 }}sec </span>
          </span>
        </div>
        <div class="menu-content">
          {{ state.name }}
        </div>
          
      </el-card>
    </el-aside>
    <el-container>
       <el-main class="cont-menu" v-if="select.id">
         <div>
         <el-dropdown @command="onSelectWait">
          <span class="el-dropdown-link">
            WAIT TIME: {{ select.wait / 1000 }}sec <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(wait, index) in WAIT_LIST"
              v-bind:value="wait"
              v-bind:key='index'
             　:command=wait>{{ wait / 1000 }}Sec</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
         </div>
         <div>
        <el-dropdown @command="onSelectState">
          <span class="el-dropdown-link">
            HTTP STATE: {{ select.status }} <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(apiState, index) in STATE_LIST"
              v-bind:value="apiState"
              v-bind:key='index'
              　:command=apiState>{{ apiState }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        </div>
 
        <v-jsoneditor v-model="jsonData" class="json-field"
                      @input="onJsonChanged">
        </v-jsoneditor>
         
       </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
  computed: {
    ...mapGetters({
      apis: 'api/apis',
      states: 'api/states',
      select: 'api/select',
    }),
  },
})
export default class AppComponent extends Vue {

  public jsonData = {};

  public WAIT_LIST = [ 0, 1000, 5000, 10000 ];

  public STATE_LIST = [ 200, 400, 401, 404, 500 ];

  public created() {
    this.$store.dispatch('api/getApis');
    this.$store.watch((state: any) =>{
      const apiState = state.api.states.find((s:any) => s.id === state.api.selectId) || {};
      return apiState.data;
    }, data => { 
      this.jsonData = data;
    });
  }

  public onSelected(id: string) {
    this.$store.dispatch('api/selected', { select: id });
  }

  onSelectWait(cmd:string) {
    this.$store.dispatch('api/updateWait', { wait: parseInt(cmd, 10) });
  }

  onSelectState(cmd:string) {
    this.$store.dispatch('api/updateState', { status: parseInt(cmd, 10) });
  }

  onJsonChanged(data:string) {
    try {
      const sendData = JSON.stringify(data);
      this.$store.dispatch('api/updateData', { data: JSON.parse(sendData), });
    } catch {
      // NP
    }
  }
}
</script>

<style>
.el-container {
  height: 100%;
}
.menu-list-item {
  cursor: pointer;
}
.active {
  background-color: aqua;
}
.menu-url {
  font-size: 10px;
}
.menu-head {
  white-space: nowrap;
  font-size: 10px;
  display: flex;
  justify-content: space-between;
}
.menu-badge-left {
  padding: 1px 2px 1px 4px;
  background-color: #2020ff;
  color: #ffffff;
  border-radius: 4px 0px 0px 4px;
  border: 1px solid #777777;
}
.menu-badge-left.warn {
  background-color: #ff2020;
}
.menu-badge-left.url {
  background-color: #777777;
}
.menu-badge-right {
  padding: 1px 4px 1px 2px;
  background-color: #ffffff;
  border-radius: 0px 4px 4px 0px;
  border: 1px solid #777777;
}

.menu-content {
  font-size: 18px;
}
.json-field {
  height: calc(100% - 80px);
}
</style>
    
    