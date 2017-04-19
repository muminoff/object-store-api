<template>
  <div id="app" class="uk-container uk-container-center uk-text-center uk-margin-large-top">
    <h1>{{ msg }}</h1>
    <vk-upload @dropped="sayHello()">
      <i class="uk-icon-cloud-upload uk-icon-medium uk-text-muted uk-margin-small-right"></i> Attach binaries by dropping them here or <a class="uk-form-file">select file<input type="file"></a>
    </vk-upload>
    <vk-breadcrumb
      @change="location = arguments[0]">
      <vk-breadcrumb-item path="/">Home</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog">Blog</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog/category">Category</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog/category/post"
        disabled>Post</vk-breadcrumb-item>
    </vk-breadcrumb>
    <vk-button @click.native="getObjects(null)">Get objects</vk-button>
    <vk-button @click.native="newFolder">New folder</vk-button>
    <vk-button @click.native="clearTable">Clear table</vk-button>
    <ul>
      <li v-for="item in items">
        <a @click="getObjects(item.id)">
          <i v-if="item.is_dir" class="uk-icon-folder"></i>
          <i v-else="item.is_dir" class="uk-icon-file"></i>
						{{ item.name }}</a>
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
    sayHello() {
      console.log("hello")
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
    getObjects(objectId) {
      const api = 'http://localhost:3000/api/objects/' + objectId
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
