<template>
  <div id="app" class="uk-container uk-container-center uk-text-center uk-margin-large-top">
    <h1>{{ msg }}</h1>
    <vk-breadcrumb
      @change="location = arguments[0]">
      <vk-breadcrumb-item path="/">Home</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog">Blog</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog/category">Category</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog/category/post"
        disabled>Post</vk-breadcrumb-item>
    </vk-breadcrumb>
    <vk-button @click.native="getObjects">Get objects</vk-button>
    <vk-button @click.native="newFolder">New folder</vk-button>
    <vk-button @click.native="clearTable">Clear table</vk-button>
    <ul>
      <li v-for="item in items">
        <a v-if="item.is_dir" @click="getObject(item.id)"><svg class="svg-icon" viewBox="0 0 20 20">
							<path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z"></path>
						</svg> {{ item.name }}</a>
        <p v-else="item.is_dir"><svg class="svg-icon" viewBox="0 0 20 20">
							<path d="M15.475,6.692l-4.084-4.083C11.32,2.538,11.223,2.5,11.125,2.5h-6c-0.413,0-0.75,0.337-0.75,0.75v13.5c0,0.412,0.337,0.75,0.75,0.75h9.75c0.412,0,0.75-0.338,0.75-0.75V6.94C15.609,6.839,15.554,6.771,15.475,6.692 M11.5,3.779l2.843,2.846H11.5V3.779z M14.875,16.75h-9.75V3.25h5.625V7c0,0.206,0.168,0.375,0.375,0.375h3.75V16.75z"></path>
						</svg> {{ item.name }}</p>
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
      msg: 'Dropbox',
      items: [],
    }
  },

  created() {
    const api = 'http://localhost:3000/api/objects/'
    axios.get(api)
      .then(response => {
        this.items = response.data.data;
      }).catch(error => {
        this.items = []
      })
  },

  methods: {
    clearTable() {
      this.items = []
    },
    newFolder() {
      const api = 'http://localhost:3000/api/objects/'
      const newFolderName = window.prompt("New folder name:")
      const data = {
        name: newFolderName,
        size: 32987235,
        is_dir: false,
        parent: null}
      axios.post(api, data)
        .then(response => {
          console.log(response)
          this.getObjects()
        }).catch(error => {
          this.getObjects()
        })
    },
    getObjects() {
      const api = 'http://localhost:3000/api/objects/'
      axios.get(api)
        .then(response => {
          this.items = response.data.data;
        }).catch(error => {
          this.items = []
        })
    },
    getObject(objectId) {
      const api = 'http://localhost:3000/api/object/' + objectId
      axios.get(api)
        .then(response => {
          console.log(response.data.data)
        }).catch(error => {
          this.items = []
        })
    }
  }

}
</script>

<style>
.svg-icon {
  width: 1em;
  height: 1em;
}

.svg-icon path,
.svg-icon polygon,
.svg-icon rect {
  fill: #4691f6;
}

.svg-icon circle {
  stroke: #4691f6;
  stroke-width: 1;
}
ul {
  list-style-type: none;
}
</style>
