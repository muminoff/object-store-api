import React, { Component } from 'react';
import Moment from "react-moment";
import 'moment/locale/uz';
import './App.css';
import prettyBytes from 'pretty-bytes';
// import folderIcon from './folder.svg'

class App extends Component {
  state = {
    apiUrl: 'http://127.0.0.1:3000/api',
    mainStorage: null,
    trashStorage: null,
    objects: [],
    breadCrumbs: [],
    root: null,
  }

  retrieveStorageInfo = () => {
    const url = `${this.state.apiUrl}/storage`;
    fetch(url)
      .then(res => res.json())
      .then(
        resp => {
          if(resp.status === 'ok')
          {
            this.setState({
              mainStorage: resp.data.main,
              trashStorage: resp.data.trash,
            })
            this.retrieveObjects()
          }
        },
        error => console.log(error)
      );
  }

  retrieveObjects = (dirObjectId) => {
    if(dirObjectId) {
      console.log('directory given, retrieving', dirObjectId)
      fetch(`${this.state.apiUrl}/${this.state.mainStorage}/objects/${dirObjectId}`)
        .then(res => res.json())
        .then(
          resp => {
            if(resp.status === 'ok')
            {
              this.setState({
                root: dirObjectId,
                objects: resp.data
              })
              this.retrieveBreadCrumbs()
            }
          },
          error => console.log(error)
        );
      return
    } else {
      console.log('no directory given, retrieving root ...')
      fetch(`${this.state.apiUrl}/${this.state.mainStorage}/objects`)
        .then(res => res.json())
        .then(
          resp => {
            if(resp.status === 'ok')
            {
              this.setState({
                objects: resp.data,
                breadCrumbs: []
              })
            }
          },
          error => console.log(error)
        );
      return
    }
  }

  retrieveBreadCrumbs = () => {
    console.log('hi', new Date())
    if(!this.state.root) return false;
    const url = `${this.state.apiUrl}/${this.state.mainStorage}/object/${this.state.root}`;
    fetch(url)
      .then(res => res.json())
      .then(
        resp => {
          if(resp.status === 'ok')
          {
            const path = resp.data.path.split('/')
            this.setState({ breadCrumbs: path })
          }
        },
        error => console.log(error)
      );
  }

  createNewFolder = () => {
    const name = prompt("Name:");
    if(!name) return false;
    const url = `${this.state.apiUrl}/${this.state.mainStorage}/directory`;
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        parent: this.state.root
      })
    })
      .then(res => res.json())
      .then(
        resp => {
          if(resp.status === 'ok')
          {
            this.retrieveObjects(this.state.root)
          }
        },
        error => {
          console.log("Got error =>", error);
        }
      );
  }

  uploadNewFile = () => {
    const name = prompt("File name:");
    if(!name) return false;
    const url = `${this.state.apiUrl}/${this.state.mainStorage}/file`;
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        parent: this.state.root,
        size: Math.floor(Math.random() * 1024 * 1024),
      })
    })
      .then(res => res.json())
      .then(
        resp => {
          if(resp.status === 'ok')
          {
            this.retrieveObjects(this.state.root)
          }
        },
        error => {
          console.log("Got error =>", error);
        }
      );
  }

  componentDidMount() {
    if(!this.state.mainStorage) {
      this.retrieveStorageInfo()
    }
  }

  compareByName = (a, b) => {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  }


  renderNoData = () => {
    return (
      <div>
        <p>No files uploaded yet.</p>
      </div>
    )
  }

  renderBreadCrumbs = () => {

    const items = this.state.breadCrumbs.map((breadCrumb, index) => {
      return (
        <li key={index}><a href='#' onClick={() => {console.log(breadCrumb)}}>{breadCrumb}</a></li>
      )
    })
    return (
      <ul className="list-horizontal">{items}</ul>
    )
  }

  folderIcon = () => {
    return (
      <svg className="folder-icon" viewBox="0 0 20 20" width={24} height={24}>
        <path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z"></path>
      </svg>
    )
  }

  fileIcon = () => {
    return (
      <svg className="file-icon" viewBox="0 0 20 20" width={24} height={24}>
        <path d="M15.475,6.692l-4.084-4.083C11.32,2.538,11.223,2.5,11.125,2.5h-6c-0.413,0-0.75,0.337-0.75,0.75v13.5c0,0.412,0.337,0.75,0.75,0.75h9.75c0.412,0,0.75-0.338,0.75-0.75V6.94C15.609,6.839,15.554,6.771,15.475,6.692 M11.5,3.779l2.843,2.846H11.5V3.779z M14.875,16.75h-9.75V3.25h5.625V7c0,0.206,0.168,0.375,0.375,0.375h3.75V16.75z"></path>
      </svg>
    )
  }

  renderData = () => {

    const dirObjects = this.state.objects.filter(obj => obj.is_dir);
    const fileObjects = this.state.objects.filter(obj => !obj.is_dir);
    const dirObjectsSorted = dirObjects.sort(this.compareByName);
    const fileObjectsSorted = fileObjects.sort(this.compareByName);
    
    return (
      <div className="app">
        <div className="container">
          <div className="row">
            <div className="column column-20">
              <h5>Documents</h5>
              <h5>Videos</h5>
              <h5>Photos</h5>
              <h5>Music</h5>
              <h5>Favorites</h5>
              <hr/>
              <h5>Trash</h5>
            </div>
            <div className="column column-80">
              {this.renderBreadCrumbs()}
              <button className="button button-outline" onClick={() => this.createNewFolder()}>New folder</button>
              <button className="button button-outline" onClick={() => this.uploadNewFile()}>New file</button>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {dirObjectsSorted.map((dirObject, index) => {
                    return (
                      <tr key={index}>
                        <td align='center'><button className="button button-clear button-file" onClick={() => this.retrieveObjects(dirObject.id)
                        }>{this.folderIcon()} {dirObject.name}</button></td>
                        <td>folder</td>
                        <td>-</td>
                        <td><Moment unix format='LLLL' locale="uz">{dirObject.last_modified}</Moment></td>
                      </tr>
                    )
                  })}
                  {fileObjectsSorted.map((fileObject, index) => {
                    return (
                      <tr key={index}>
                        <td><a href='#'>{this.fileIcon()} {fileObject.name}</a></td>
                        <td>file</td>
                        <td>{prettyBytes(fileObject.size)}</td>
                        <td><Moment unix format='LLLL' locale="uz">{fileObject.last_modified}</Moment></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
  render() {
    return this.renderData()
  }
}

export default App;
