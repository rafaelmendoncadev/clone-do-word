import { contextBridge, ipcRenderer } from 'electron'
import type { IpcApi } from '../shared/types/ipc'

const api: IpcApi = {
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion')
  },
  dialog: {
    openDocx: () => ipcRenderer.invoke('dialog:openDocx'),
    saveDocx: (defaultPath, bytes) => ipcRenderer.invoke('dialog:saveDocx', defaultPath, bytes),
    pickImage: () => ipcRenderer.invoke('dialog:pickImage')
  },
  fs: {
    readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path, bytes) => ipcRenderer.invoke('fs:writeFile', path, bytes)
  },
  window: {
    setTitle: (title, dirty) => ipcRenderer.invoke('window:setTitle', title, dirty),
    setDirty: (dirty) => ipcRenderer.invoke('window:setDirty', dirty)
  },
  menu: {
    onAction: (callback) => {
      const handler = (_e: Electron.IpcRendererEvent, action: string) => callback(action)
      ipcRenderer.on('menu:action', handler)
      return () => ipcRenderer.removeListener('menu:action', handler)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)
