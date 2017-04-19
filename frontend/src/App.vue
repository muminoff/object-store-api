<template>
  <div id="app" class="uk-container uk-container-center uk-text-center uk-margin-large-top">
    <h1>{{ msg }}</h1>
    <vk-button @click.native="getObjects">Get objects</vk-button>
    <ul id="example">
      <li v-for="item in items">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'app',
  data () {
    return {
      msg: 'Objects',
      items: [],
    }
  },

  methods: {
    getObjects() {
      const api = 'http://localhost:3000/api/objects'
      axios.get(api)
        .then(response => {
          this.items = response.data.data;
        }).catch(error => {
          console.log(error);
        })
    }
  }

}
</script>

<style>
ul {
  list-style-type: none;
}
</style>
