export interface OpenResult {
  path: string
  name: string
  bytes: Uint8Array
  ext?: string
}

export interface IpcApi {
  app: {
    getVersion(): Promise<string>
  }
  dialog: {
    openDocx(): Promise<OpenResult | null>
    saveDocx(defaultPath: string, bytes: Uint8Array): Promise<string | null>
    pickImage(): Promise<OpenResult | null>
  }
  fs: {
    readFile(path: string): Promise<Uint8Array>
    writeFile(path: string, bytes: Uint8Array): Promise<void>
  }
  window: {
    setTitle(title: string, dirty: boolean): Promise<void>
    setDirty(dirty: boolean): Promise<void>
  }
  print: {
    exportPdf(defaultPath: string, header?: string, footer?: string): Promise<string | null>
    document(): Promise<void>
  }
  menu: {
    onAction(callback: (action: string) => void): () => void
  }
}

declare global {
  interface Window {
    api: IpcApi
  }
}
