<template>
  <div id="app" class="uk-container uk-margin-large-top">
    <h1>{{ msg }}</h1>
    <vk-button id="target"
      @click.native="show = !show">
      Username
    </vk-button>
    <vk-dropdown target="#target"
      :show="show">
      Logout
    </vk-dropdown>
    <vk-breadcrumb location="/blog"
      :location="location"
      @change="location = arguments[0]">
      <vk-breadcrumb-item path="/">Home</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog">Blog</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog/category">Category</vk-breadcrumb-item>
      <vk-breadcrumb-item path="/blog/category/post">Post</vk-breadcrumb-item>
    </vk-breadcrumb>
    <vk-button @click.native="getObjects()"><i class="uk-icon-refresh"></i></vk-button>
    <vk-button @click.native="newFolder"><i class="uk-icon-plus"></i></vk-button>
    <vk-button @click.native="newFile"><i class="uk-icon-cloud-upload"></i></vk-button>
    <vk-button @click.native="getPathInfo"><i class="uk-icon-info"></i></vk-button>
    <vk-table
      selectable
      sortable
      hover
      condensed
      trackBy="id"
      :fields="[{
      name: 'name',
      sortBy: true
      }, {
      name: 'content_type',
      headerClass: 'vk-table-width-minimum',
      header: 'Type'
      }, {
      name: 'size',
      headerClass: 'vk-table-width-minimum',
      }, {
      name: 'last_modified',
      header: 'Last modified'
      }]"
      :rows="items">
    </vk-table>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'app',
  data () {
    return {
      msg: 'Dropbucks',
      items: [],
      currentStorage: 'b4d053da-e277-4b34-b86d-d3e0d0d34c69',
      currentDir: null,
      location: '/',
      show: false
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
          if (this.currentDir !== null) {
            this.getObjects(this.currentDir)
          } else {
            getObjects()
          }
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
        size: Math.floor(Math.random() * 1024 * 1024),
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
      let api = 'http://localhost:3000/api/' + this.currentStorage + '/objects/'
      if (objectId !== undefined && objectId !== null) {
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
    getPathInfo() {
      if (this.currentDir !== null) {
        let api = 'http://localhost:3000/api/' + this.currentStorage + '/object/' + this.currentDir
        axios.get(api)
          .then(response => {
            console.log(response.data.data)
          }).catch(error => {
            this.items = []
          })
      }
    },
    removeObject(objectId) {
      const api = 'http://localhost:3000/api/' + this.currentStorage + '/object/' + objectId
      axios.delete(api)
        .then(response => {
          if (this.currentDir !== null) {
            this.getObjects(this.currentDir)
          } else {
            getObjects()
          }
        }).catch(error => {
          this.items = []
        })
    },

  }

}
</script>

<style>
body {
  font-size: 18px;
}
ul {
  list-style-type: none;
}
</style>
