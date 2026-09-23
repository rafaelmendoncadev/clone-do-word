import type { Editor } from '@tiptap/react'
import { importDocx, docxToProseMirror } from '../../docx'
import { toUint8Array } from '../../docx/import/bytes'
import { useDocumentStore } from '../stores/useDocumentStore'
import { useEditorStore } from '../stores/useEditorStore'
import { useRecentFilesStore } from '../stores/useRecentFilesStore'
import { countWords } from '@shared/lib/format'
import type { OpenResult } from '@shared/types/ipc'

export { toUint8Array }

/** Espera o editor TipTap ficar disponível no store (onCreate é async). */
export async function resolveEditor(timeoutMs = 5000): Promise<Editor | null> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const current = useEditorStore.getState().editor
    if (current && !current.isDestroyed) return current
    await new Promise((r) => setTimeout(r, 50))
  }
  return useEditorStore.getState().editor
}

export async function openDocxIntoEditor(preferred?: Editor | null): Promise<void> {
  const docStore = useDocumentStore.getState()

  let result: OpenResult | null | undefined
  try {
    result = await window.api?.dialog.openDocx()
  } catch (err) {
    console.error('Falha ao abrir diálogo:', err)
    alert('Não foi possível abrir o seletor de arquivos.')
    return
  }

  if (!result) return

  const editor = preferred && !preferred.isDestroyed ? preferred : await resolveEditor()
  if (!editor || editor.isDestroyed) {
    alert('Editor ainda não está pronto. Tente novamente em instantes.')
    return
  }

  try {
    const bytes = toUint8Array(result.bytes)
    const doc = await importDocx(bytes)
    const pmDoc = docxToProseMirror(doc)
    editor.commands.setContent(pmDoc)
    const text = editor.getText() || ''
    docStore.setFileName(result.name)
    docStore.setFilePath(result.path)
    docStore.setOriginalParts(doc.originalParts)
    docStore.setWordCount(countWords(text))
    docStore.setDirty(false)
    void window.api?.window.setTitle(result.name, false)

    useRecentFilesStore.getState().addFile({
      path: result.path,
      name: result.name,
      lastOpened: new Date().toLocaleDateString('pt-BR')
    })
  } catch (err) {
    console.error('Erro ao abrir .docx:', err)
    alert(`Erro ao abrir o arquivo .docx\n${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function openRecentPath(filePath: string, preferred?: Editor | null): Promise<boolean> {
  const docStore = useDocumentStore.getState()
  const editor = preferred && !preferred.isDestroyed ? preferred : await resolveEditor()
  if (!editor || editor.isDestroyed) return false

  try {
    const bytes = await window.api?.fs.readFile(filePath)
    if (!bytes) return false
    const doc = await importDocx(toUint8Array(bytes))
    const pmDoc = docxToProseMirror(doc)
    editor.commands.setContent(pmDoc)
    const name = filePath.split(/[/\\]/).pop() || 'Documento.docx'
    docStore.setFileName(name)
    docStore.setFilePath(filePath)
    docStore.setOriginalParts(doc.originalParts)
    docStore.setWordCount(countWords(editor.getText() || ''))
    docStore.setDirty(false)
    void window.api?.window.setTitle(name, false)

    useRecentFilesStore.getState().addFile({
      path: filePath,
      name,
      lastOpened: new Date().toLocaleDateString('pt-BR')
    })
    return true
  } catch (err) {
    console.error('Erro ao abrir documento recente:', err)
    alert(`Não foi possível abrir o arquivo recente:\n${err instanceof Error ? err.message : String(err)}`)
    return false
  }
}
