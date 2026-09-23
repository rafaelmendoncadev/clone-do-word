import { app, BrowserWindow, Menu, shell, dialog } from 'electron'
import { join } from 'path'
import { registerIpcHandlers, shouldConfirmClose, dirtyWindows, closeAfterSave, setForceCloseAll } from './ipc'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Clone do Word',
    show: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  })

  win.focus()

  win.on('ready-to-show', () => {
    win.show()
    win.focus()
    win.setAlwaysOnTop(true)
    win.setAlwaysOnTop(false)
  })

  // Garantir exibição e foco mesmo se ready-to-show atrasar
  setTimeout(() => {
    if (!win.isDestroyed()) {
      if (!win.isVisible()) win.show()
      win.focus()
      win.setAlwaysOnTop(true)
      win.setAlwaysOnTop(false)
    }
  }, 1000)

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('Falha ao carregar janela:', errorCode, errorDescription, validatedURL)
    if (!win.isDestroyed() && !win.isVisible()) {
      win.show()
    }
  })

  win.on('close', (e) => {
    if (!shouldConfirmClose(win)) {
      dirtyWindows.delete(win.id)
      return
    }
    e.preventDefault()
    void dialog
      .showMessageBox(win, {
        type: 'warning',
        buttons: ['Salvar', 'Não salvar', 'Cancelar'],
        defaultId: 0,
        cancelId: 2,
        title: 'Clone do Word',
        message: 'Deseja salvar as alterações?',
        detail: 'As alterações não salvas serão perdidas.'
      })
      .then(({ response }) => {
        if (response === 2) return
        if (response === 0) {
          closeAfterSave.add(win.id)
          win.webContents.send('menu:action', 'file.save')
          return
        }
        setForceCloseAll(true)
        dirtyWindows.delete(win.id)
        win.close()
      })
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  const menu = buildMenu(win)
  Menu.setApplicationMenu(menu)

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function buildMenu(win: BrowserWindow): Menu {
  return Menu.buildFromTemplate([
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Novo',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('menu:action', 'file.new')
        },
        {
          label: 'Abrir…',
          accelerator: 'CmdOrCtrl+O',
          click: () => win.webContents.send('menu:action', 'file.open')
        },
        { type: 'separator' },
        {
          label: 'Salvar',
          accelerator: 'CmdOrCtrl+S',
          click: () => win.webContents.send('menu:action', 'file.save')
        },
        {
          label: 'Salvar como…',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => win.webContents.send('menu:action', 'file.saveAs')
        },
        { type: 'separator' },
        {
          label: 'Exportar PDF…',
          click: () => win.webContents.send('menu:action', 'file.exportPdf')
        },
        {
          label: 'Imprimir…',
          accelerator: 'CmdOrCtrl+P',
          click: () => win.webContents.send('menu:action', 'file.print')
        },
        { type: 'separator' },
        {
          label: 'Sair',
          click: () => {
            const focused = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
            focused?.close()
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { type: 'separator' },
        {
          label: 'Localizar…',
          accelerator: 'CmdOrCtrl+F',
          click: () => win.webContents.send('menu:action', 'edit.find')
        },
        {
          label: 'Substituir…',
          accelerator: 'CmdOrCtrl+H',
          click: () => win.webContents.send('menu:action', 'edit.replace')
        }
      ]
    },
    {
      label: 'Exibir',
      submenu: [
        { role: 'zoomIn', label: 'Ampliar' },
        { role: 'zoomOut', label: 'Reduzir' },
        { role: 'resetZoom', label: 'Restaurar zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela cheia' },
        { type: 'separator' },
        {
          label: 'Alternar ferramentas de desenvolvedor',
          accelerator: 'F12',
          click: () => win.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => win.webContents.send('menu:action', 'help.about')
        }
      ]
    }
  ])
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
