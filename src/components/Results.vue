<template>
    <table>
        <thead>
            <th v-for="column in columns" v-bind:key="column">{{column}}</th>
        </thead>
        <tbody>
            <tr v-for="row in rows" v-bind:key="row">
                <td v-for="column in columns" v-bind:key="column">{{row[column]}}</td>
            </tr>
        </tbody>
    </table>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Results extends Vue {
  @Prop() private rows!: any[];

  get columns () {
    if (this.rows && this.rows.length > 0) {
      return Object.keys(this.rows[0])
    }
    return []
  }
}
</script>
