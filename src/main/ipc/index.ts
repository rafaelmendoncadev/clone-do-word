import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { basename, extname } from 'path'
import { validatePath } from '../utils/path-guard'

/**
 * Normaliza bytes vindos do renderer via contextBridge/IPC.
 * TypedArray pode chegar como objeto plano, ArrayBuffer ou { type: 'Buffer', data }.
 */
function toIpcBuffer(data: unknown): Buffer {
  if (Buffer.isBuffer(data)) return data
  if (data instanceof Uint8Array) return Buffer.from(data.buffer, data.byteOffset, data.byteLength)
  if (data instanceof ArrayBuffer) return Buffer.from(data)
  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView
    return Buffer.from(view.buffer, view.byteOffset, view.byteLength)
  }
  if (Array.isArray(data)) return Buffer.from(data)
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (record.type === 'Buffer' && Array.isArray(record.data)) {
      return Buffer.from(record.data as number[])
    }
    const keys = Object.keys(record)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
    if (keys.length > 0) {
      return Buffer.from(keys.map((k) => Number(record[k]) & 0xff))
    }
  }
  throw new Error('Bytes inválidos recebidos do renderer')
}

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
    await writeFile(result.filePath, toIpcBuffer(bytes))
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
    const buf = toIpcBuffer(bytes)
    if (buf.byteLength === 0) {
      throw new Error('Nada para gravar: conteúdo vazio')
    }
    await writeFile(path, buf)
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

  ipcMain.handle('window:setDirty', (_e, dirty: boolean) => {
    const win = parentWindow()
    if (win) {
      dirtyWindows.set(win.id, dirty)
      const suffix = ' — Clone do Word'
      const current = win.getTitle().replace(/^[●]\s+/, '')
      const title = current.endsWith(suffix) ? current.slice(0, -suffix.length) : current
      win.setTitle(`${dirty ? '● ' : ''}${title || 'Documento'}${suffix}`)
      if (!dirty && closeAfterSave.has(win.id)) {
        closeAfterSave.delete(win.id)
        setForceCloseAll(true)
        win.close()
      }
    }
  })

  ipcMain.handle('print:pdf', async (_e, defaultPath: string) => {
    const win = parentWindow()
    if (!win) return null
    const pdfDefault = defaultPath ? defaultPath.replace(/\.docx$/i, '.pdf') : 'Documento.pdf'
    const result = await dialog.showSaveDialog(win, {
      title: 'Exportar PDF',
      defaultPath: pdfDefault,
      filters: [{ name: 'Documento PDF (*.pdf)', extensions: ['pdf'] }]
    })
    if (result.canceled || !result.filePath) return null
    validatePath(result.filePath)
    const pdfData = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4'
    })
    await writeFile(result.filePath, pdfData)
    return result.filePath
  })

  ipcMain.handle('print:document', async () => {
    const win = parentWindow()
    if (!win) return
    win.webContents.print({ silent: false, printBackground: true })
  })
}
