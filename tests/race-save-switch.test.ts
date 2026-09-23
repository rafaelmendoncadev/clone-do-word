// @vitest-environment happy-dom
/**
 * DIAGNÓSTICO da corrida: salvar (fire-and-forget, como TitleBar/Ctrl+S fazem via
 * `void saveCurrentDocument()`) + trocar de arquivo imediatamente + reabrir o arquivo.
 * Se a reabertura acontecer ANTES de a gravação assíncrona terminar, o editor
 * exibe o conteúdo antigo — "como se nunca tivesse sido salvo".
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
import { exportDocx, proseMirrorToDocx, importDocx, docxToProseMirror } from '../src/docx'

const dir = mkdtempSync(join(tmpdir(), 'clone-word-race-'))
let pathA = ''
let pathB = ''
let openQueue: Array<{ path: string; name: string }> = []
/** atraso da gravação — simula compressão de docx grande (vários MB) */
let writeDelayMs = 0

beforeEach(async () => {
  const mk = async (text: string) => {
    const doc = proseMirrorToDocx(
      { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
      new Map()
    )
    return exportDocx(doc)
  }
  pathA = join(dir, 'docA.docx')
  pathB = join(dir, 'docB.docx')
  writeFileSync(pathA, await mk('TEXTO ORIGINAL A'))
  writeFileSync(pathB, await mk('TEXTO ORIGINAL B'))
  useDocumentStore.getState().newDocument()
  openQueue = []
  writeDelayMs = 0

  ;(window as unknown as { api: unknown }).api = {
    dialog: {
      openDocx: async () => {
        const next = openQueue.shift()
        return next
          ? { path: next.path, name: next.name, bytes: new Uint8Array(readFileSync(next.path)) }
          : null
      },
      saveDocx: async () => null,
      pickImage: async () => null
    },
    fs: {
      readFile: async (p: string) => new Uint8Array(readFileSync(p)),
      writeFile: async (p: string, bytes: Uint8Array) => {
        if (writeDelayMs > 0) await new Promise((r) => setTimeout(r, writeDelayMs))
        writeFileSync(p, bytes)
      }
    },
    window: { setTitle: async () => undefined, setDirty: async () => undefined },
    app: { getVersion: async () => '0.0.0' },
    print: { exportPdf: async () => null, document: async () => undefined },
    menu: { onAction: () => () => undefined }
  }
  vi.stubGlobal('alert', vi.fn())
})

afterAll(() => rmSync(dir, { recursive: true, force: true }))

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

describe('corrida salvar × trocar/reabrir arquivo', () => {
  it('SEM demora de gravação: reaberto exibe ALTERADO (controle)', async () => {
    const editor = makeEditor()
    openQueue.push({ path: pathA, name: 'docA.docx' })
    await openDocxIntoEditor(editor)
    editor.commands.insertContent(' ALTERADO')

    void saveCurrentDocument() // fire-and-forget, como a TitleBar/Ctrl+S
    openQueue.push({ path: pathB, name: 'docB.docx' })
    await openDocxIntoEditor(editor)
    await openRecentPath(pathA, editor)

    expect(editor.getText()).toContain('ALTERADO')
  })

  it('COM gravação lenta (docx grande): reaberto ANTES da gravação terminar mostra conteúdo ANTIGO', async () => {
    const editor = makeEditor()
    openQueue.push({ path: pathA, name: 'docA.docx' })
    await openDocxIntoEditor(editor)
    editor.commands.insertContent(' ALTERADO')

    writeDelayMs = 300 // exportAsync + writeFile demoram (compressão de pacote grande)
    void saveCurrentDocument() // fire-and-forget

    // usuário "em seguida" troca de arquivo e reabre o modificado (cliques rápidos em recentes)
    openQueue.push({ path: pathB, name: 'docB.docx' })
    await openDocxIntoEditor(editor)
    await openRecentPath(pathA, editor)

    const mostrado = editor.getText()
    const discoAindaAntigo = !mostrado.includes('ALTERADO')
    console.log('[DIAG] exibido após reabrir:', JSON.stringify(mostrado))
    console.log('[DIAG] exibiu conteúdo antigo (perdeu ALTERADO)?', discoAindaAntigo)

    // aguarda o save em flight terminar — o disco DEPOIS contém as alterações
    await new Promise((r) => setTimeout(r, 500))
    const onDisk = await importDocx(new Uint8Array(readFileSync(pathA)))
    const discoFinal = JSON.stringify(docxToProseMirror(onDisk))
    console.log('[DIAG] disco após save terminar contém ALTERADO?', discoFinal.includes('ALTERADO'))

    // ESTA é a asserção do bug relatado: o que o usuário VÊ ao reabrir
    expect(mostrado).toContain('ALTERADO')
  })

  it('agravante: salvar por cima do conteúdo antigo exibido destrói as alterações em disco', async () => {
    const editor = makeEditor()
    openQueue.push({ path: pathA, name: 'docA.docx' })
    await openDocxIntoEditor(editor)
    editor.commands.insertContent(' ALTERADO')

    writeDelayMs = 300
    void saveCurrentDocument()

    openQueue.push({ path: pathB, name: 'docB.docx' })
    await openDocxIntoEditor(editor)
    await openRecentPath(pathA, editor) // exibe A antigo
    await new Promise((r) => setTimeout(r, 500)) // save antigo termina (disco = A modificado)

    // usuário, vendo "sem as alterações", digita e salva de novo
    editor.commands.insertContent(' NOVA TENTATIVA')
    await saveCurrentDocument()

    const onDisk = await importDocx(new Uint8Array(readFileSync(pathA)))
    const texto = JSON.stringify(docxToProseMirror(onDisk))
    console.log('[DIAG] disco após salvar por cima:', texto.slice(0, 200))
    expect(texto).toContain('ALTERADO')
  })
})
