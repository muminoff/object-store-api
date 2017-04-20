<template>
  <div id="app" class="uk-container uk-container-center uk-text-center uk-margin-large-top">
    <h1>{{ msg }}</h1>
    <vk-breadcrumb
      @change="location = arguments[0]">
      <vk-breadcrumb-item path="/">Home</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog">Blog</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog/category">Category</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog/category/post">Post</vk-breadcrumb-item>
    </vk-breadcrumb>
    <vk-button @click.native="getObjects()">Get objects</vk-button>
    <vk-button @click.native="newFolder">New folder</vk-button>
    <vk-button @click.native="newFile">New file</vk-button>
    <vk-button @click.native="clearTable">Clear table</vk-button>
    <vk-button @click.native="getPathInfo(currentDir)">Get path info</vk-button>
    <ul>
      <li v-for="item in items">
        <i v-if="item.is_dir" class="uk-icon-folder"></i>
        <i v-else="item.is_dir" class="uk-icon-file"></i>
        <a v-if="item.is_dir" @click="getObject(item.id)"> {{ item.name }}</a>
        <span v-else="item.is_dir"><p>{{ item.name }}</p></span>
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
      currentStorage: 'b4d053da-e277-4b34-b86d-d3e0d0d34c69',
      currentDir: null
    }
  },

  created() {
    this.getStorage()
    this.getObjects()
  },

  methods: {
    getStorage() {
      const api = 'http://localhost:3000/api/storage'
      axios.get(api)
        .then(response => {
          this.items = response.data.data
          this.currentStorage = response.data[0].main
        }).catch(error => {
          this.items = []
        })
    },
    clearTable() {
      this.items = []
    },
    newFolder() {
      const api = `http://localhost:3000/api/${this.currentStorage}/directory/`
      const newFolderName = window.prompt("New folder name:")
      const data = {
        name: newFolderName,
        parent: this.currentDir,
        storage: this.currentStorage
      }
      axios.post(api, data)
        .then(response => {
          this.getObjects(this.currentDir)
        }).catch(error => {
          this.getObjects()
        })
    },
    newFile() {
      const api = `http://localhost:3000/api/${this.currentStorage}/file/`
      const newFileName = window.prompt("New file name:")
      const data = {
        name: newFileName,
        is_dir: false,
        size: 25498125,
        parent: this.currentDir,
        storage: this.currentStorage
      }
      axios.post(api, data)
        .then(response => {
          this.getObjects(this.currentDir)
        }).catch(error => {
          this.getObjects()
        })
    },
    getObjects(objectId) {
      var api = 'http://localhost:3000/api/' + this.currentStorage + '/objects/'
      if (objectId !== undefined) {
        api = api + objectId
      }
      axios.get(api)
        .then(response => {
          this.items = response.data.data
        }).catch(error => {
          this.items = []
        })
    },
    getObject(objectId) {
      const api = 'http://localhost:3000/api/' + this.currentStorage + '/objects/' + objectId
      axios.get(api)
        .then(response => {
          this.items = response.data.data
          this.currentDir = objectId
        }).catch(error => {
          this.items = []
        })
    },
    getPathInfo(objectId) {
      const api = 'http://localhost:3000/api/' + this.currentStorage + '/object/' + objectId
      axios.get(api)
        .then(response => {
        }).catch(error => {
          this.items = []
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
