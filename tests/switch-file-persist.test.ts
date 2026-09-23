// @vitest-environment happy-dom
/**
 * Diagnóstico: reproduz o fluxo do bug relatado:
 * abrir A → modificar → salvar → abrir B → reabrir A.
 * Usa os módulos REAIS (open-docx, stores, exportDocx) e arquivos reais em disco.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { Editor } from '@tiptap/core'
import { createEditorExtensions } from '../src/renderer/editor/extensions/schema'
import { openDocxIntoEditor, openRecentPath } from '../src/renderer/lib/open-docx'
import { saveCurrentDocument } from '../src/renderer/lib/save-docx'
import { useDocumentStore } from '../src/renderer/stores/useDocumentStore'
import { useEditorStore } from '../src/renderer/stores/useEditorStore'
import { exportDocx, importDocx, docxToProseMirror, proseMirrorToDocx } from '../src/docx'

const dir = mkdtempSync(join(tmpdir(), 'clone-word-persist-'))
let pathA = ''
let pathB = ''
let openQueue: Array<{ path: string; name: string; bytes: Uint8Array }> = []

async function makeDocx(text: string): Promise<Uint8Array> {
  const pm = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
  }
  const doc = proseMirrorToDocx(pm, new Map())
  return exportDocx(doc)
}

function makeEditor(): Editor {
  const el = document.createElement('div')
  document.body.appendChild(el)
  const editor = new Editor({
    element: el,
    extensions: createEditorExtensions(),
    content: '<p></p>'
  })
  useEditorStore.getState().setEditor(editor)
  return editor
}

beforeEach(async () => {
  const bytesA = await makeDocx('TEXTO ORIGINAL A')
  const bytesB = await makeDocx('TEXTO ORIGINAL B')
  pathA = join(dir, 'docA.docx')
  pathB = join(dir, 'docB.docx')
  writeFileSync(pathA, bytesA)
  writeFileSync(pathB, bytesB)

  useDocumentStore.getState().newDocument()
  openQueue = []

  ;(window as unknown as { api: unknown }).api = {
    dialog: {
      openDocx: async () => {
        const next = openQueue.shift()
        if (!next) return null
        return {
          path: next.path,
          name: next.name,
          bytes: new Uint8Array(readFileSync(next.path))
        }
      },
      saveDocx: async () => null,
      pickImage: async () => null
    },
    fs: {
      readFile: async (p: string) => new Uint8Array(readFileSync(p)),
      writeFile: async (p: string, bytes: Uint8Array) => {
        writeFileSync(p, bytes)
      }
    },
    window: {
      setTitle: async () => undefined,
      setDirty: async () => undefined
    },
    app: { getVersion: async () => '0.0.0-test' },
    print: { exportPdf: async () => null, document: async () => undefined },
    menu: { onAction: () => () => undefined }
  }
  vi.stubGlobal('alert', vi.fn())
})

afterAll(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('bug relatado: abrir A → editar → salvar → abrir B → reabrir A', () => {
  it('reabrir A deve exibir as alterações salvas (save aguardado)', async () => {
    const editor = makeEditor()

    // 1. carregar arquivo A
    openQueue.push({ path: pathA, name: 'docA.docx', bytes: new Uint8Array() })
    await openDocxIntoEditor(editor)
    expect(editor.getText()).toContain('TEXTO ORIGINAL A')

    // 2. modificar
    editor.commands.insertContent(' ALTERADO')
    expect(editor.getText()).toContain('ALTERADO')

    // 3. salvar (aguardando, como o handler de menu faz)
    await saveCurrentDocument()

    // 4. abrir outro arquivo (B)
    openQueue.push({ path: pathB, name: 'docB.docx', bytes: new Uint8Array() })
    await openDocxIntoEditor(editor)
    expect(editor.getText()).toContain('TEXTO ORIGINAL B')

    // 5. reabrir A
    const ok = await openRecentPath(pathA, editor)
    expect(ok).toBe(true)
    expect(editor.getText()).toContain('ALTERADO')
  })

  it('disco: arquivo A deve conter ALTERADO após o ciclo', async () => {
    const editor = makeEditor()
    openQueue.push({ path: pathA, name: 'docA.docx', bytes: new Uint8Array() })
    await openDocxIntoEditor(editor)
    editor.commands.insertContent(' ALTERADO')
    await saveCurrentDocument()
    openQueue.push({ path: pathB, name: 'docB.docx', bytes: new Uint8Array() })
    await openDocxIntoEditor(editor)

    // inspeciona o arquivo salvo em disco diretamente (sem passar pelo editor)
    const onDisk = await importDocx(new Uint8Array(readFileSync(pathA)))
    const pm = docxToProseMirror(onDisk) as {
      content: Array<{ content?: Array<{ text?: string }> }>
    }
    expect(JSON.stringify(pm)).toContain('ALTERADO')
  })

  it('corrida: save disparado sem await + troca imediata de arquivo', async () => {
    const editor = makeEditor()
    openQueue.push({ path: pathA, name: 'docA.docx', bytes: new Uint8Array() })
    await openDocxIntoEditor(editor)
    editor.commands.insertContent(' ALTERADO')

    // 3'. salvar SEM aguardar (como o botão da TitleBar / Ctrl+S via app:save)
    const savePromise = saveCurrentDocument()

    // 4'. abrir B imediatamente
    openQueue.push({ path: pathB, name: 'docB.docx', bytes: new Uint8Array() })
    await openDocxIntoEditor(editor)

    // 5'. reabrir A imediatamente
    await openRecentPath(pathA, editor)
    await savePromise

    // o que importa: o disco precisa ter as alterações
    const onDisk = await importDocx(new Uint8Array(readFileSync(pathA)))
    const pm = docxToProseMirror(onDisk) as {
      content: Array<{ content?: Array<{ text?: string }> }>
    }
    expect(JSON.stringify(pm)).toContain('ALTERADO')
  })

  it('estado: após corrida, salvar B não pode sobrescrever o arquivo A', async () => {
    const editor = makeEditor()
    openQueue.push({ path: pathA, name: 'docA.docx', bytes: new Uint8Array() })
    await openDocxIntoEditor(editor)
    editor.commands.insertContent(' ALTERADO')

    const savePromise = saveCurrentDocument()
    openQueue.push({ path: pathB, name: 'docB.docx', bytes: new Uint8Array() })
    await openDocxIntoEditor(editor)
    await savePromise

    // usuário edita B e salva
    editor.commands.insertContent(' DO B')
    await saveCurrentDocument()

    const bOnDisk = await importDocx(new Uint8Array(readFileSync(pathB)))
    const aOnDisk = await importDocx(new Uint8Array(readFileSync(pathA)))
    const pmB = JSON.stringify(docxToProseMirror(bOnDisk))
    const pmA = JSON.stringify(docxToProseMirror(aOnDisk))
    expect(pmB).toContain('DO B')
    expect(pmA).toContain('ALTERADO')
    expect(pmA).not.toContain('DO B')
  })
})
