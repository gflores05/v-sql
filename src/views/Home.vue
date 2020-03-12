<template>
  <div class="home">
    <div v-if="message">{{message}}</div>
    <label for="data">Data</label>
    <textarea id="data" v-model="raw"></textarea>
    <label for="query">Query</label>
    <textarea id="query" v-model="query"></textarea>
    <button type="button" @click="runQuery()">Run</button>
    <div v-for="tableId in tables" v-bind:key="tableId">
      <h2>{{tableId}}</h2>
      <results v-bind:rows="universe[tableId]"></results>
    </div>
    <h2>Final Result</h2>
    <results v-bind:rows="finalResult"></results>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
// @ is an alias to /src
import Results from '@/components/Results.vue'

import { SqlService } from '../services/sql.service'

@Component({
  components: {
    results: Results
  }
})
export default class Home extends Vue {
  universe: any = {};
  data: any[] = [];
  raw = '';
  message = '';
  service = new SqlService();
  tables: string[] = [];

  finalResult: any[] = [];
  query: string = ''

  runQuery () {
    try {
      this.message = ''

      const parsed = JSON.parse(this.raw)

      if (typeof parsed === 'object') {
        this.universe = parsed
      }
      this.tables = Object.keys(this.universe)

      this.finalResult = this.service.runQuery(this.query, this.universe)
    } catch (error) {
      this.message = 'The input should be a valid json array'
      console.error(error)
    }
  }
}
</script>
