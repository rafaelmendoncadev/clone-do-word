import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { basename, extname } from 'path'
import { validatePath } from '../utils/path-guard'

function parentWindow(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null
}

/** dirty por BrowserWindow id — usado na confirmação ao fechar */
export const dirtyWindows = new Map<number, boolean>()
export const closeAfterSave = new Set<number>()
let forceCloseAll = false

export function setForceCloseAll(value: boolean): void {
  forceCloseAll = value
}

export function shouldConfirmClose(win: BrowserWindow): boolean {
  if (forceCloseAll) return false
  return dirtyWindows.get(win.id) === true
}

async function showOpen(filters: Electron.FileFilter[], title: string) {
  const win = parentWindow()
  const options: Electron.OpenDialogOptions = { title, filters, properties: ['openFile'] }
  return win ? dialog.showOpenDialog(win, options) : dialog.showOpenDialog(options)
}

async function showSave(defaultPath: string) {
  const win = parentWindow()
  const options: Electron.SaveDialogOptions = {
    title: 'Salvar documento',
    defaultPath,
    filters: [{ name: 'Documento Word', extensions: ['docx'] }]
  }
  return win ? dialog.showSaveDialog(win, options) : dialog.showSaveDialog(options)
}

export function registerIpcHandlers(): void {
  ipcMain.handle('app:getVersion', () => app.getVersion())

  ipcMain.handle('dialog:openDocx', async () => {
    const result = await showOpen(
      [
        { name: 'Documentos Word', extensions: ['docx', 'doc'] },
        { name: 'Todos os arquivos', extensions: ['*'] }
      ],
      'Abrir documento'
    )
    if (result.canceled || result.filePaths.length === 0) return null
    const path = result.filePaths[0]
    const bytes = await readFile(path)
    return { path, name: basename(path), bytes: new Uint8Array(bytes) }
  })

  ipcMain.handle('dialog:saveDocx', async (_e, defaultPath: string, bytes: Uint8Array) => {
    const result = await showSave(defaultPath)
    if (result.canceled || !result.filePath) return null
    validatePath(result.filePath)
    await writeFile(result.filePath, bytes)
    return result.filePath
  })

  ipcMain.handle('dialog:pickImage', async () => {
    const result = await showOpen(
      [{ name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'] }],
      'Inserir imagem'
    )
    if (result.canceled || result.filePaths.length === 0) return null
    const path = result.filePaths[0]
    const bytes = await readFile(path)
    return { path, name: basename(path), ext: extname(path), bytes: new Uint8Array(bytes) }
  })

  ipcMain.handle('fs:readFile', async (_e, path: string) => {
    validatePath(path)
    const bytes = await readFile(path)
    return new Uint8Array(bytes)
  })

  ipcMain.handle('fs:writeFile', async (_e, path: string, bytes: Uint8Array) => {
    validatePath(path)
    await writeFile(path, bytes)
  })

  ipcMain.handle('window:setTitle', (_e, title: string, dirty: boolean) => {
    const win = parentWindow()
    if (win) {
      dirtyWindows.set(win.id, dirty)
      win.setTitle(`${dirty ? '● ' : ''}${title} — Clone do Word`)
      if (!dirty && closeAfterSave.has(win.id)) {
        closeAfterSave.delete(win.id)
        setForceCloseAll(true)
        win.close()
      }
    }
  })

  ipcMain.handle('window:setDirty', (e, dirty: boolean) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (win) dirtyWindows.set(win.id, dirty)
  })
}
