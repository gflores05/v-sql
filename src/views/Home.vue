<template>
  <div class="home">
    <div v-if="message">{{message}}</div>
    <textarea v-model="raw"></textarea>
    <button type="button" @click="runQuery()">Run</button>
    <results v-bind:rows="filtered"></results>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
// @ is an alias to /src
import Results from '@/components/Results.vue'

@Component({
  components: {
    results: Results
  }
})
export default class Home extends Vue {
  universe = [];
  filtered = [];
  raw = '';
  message = '';

  runQuery () {
    try {
      this.message = ''

      const parsed = JSON.parse(this.raw)

      if (typeof parsed === 'object' && parsed.length) {
        this.universe = parsed
      }
      this.filtered = this.universe
    } catch (error) {
      this.message = 'The input should be a valid json array'
    }
  }
}
</script>
