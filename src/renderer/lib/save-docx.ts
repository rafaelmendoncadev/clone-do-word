import { exportDocx, proseMirrorToDocx } from '../../docx'
import { useDocumentStore } from '../stores/useDocumentStore'
import { useEditorStore } from '../stores/useEditorStore'
import { useRecentFilesStore } from '../stores/useRecentFilesStore'
import { enqueueSave } from './save-queue'

/**
 * Salva o documento atual no caminho já aberto (ou via diálogo se for novo).
 * Serializado pelo `enqueueSave`: aberturas chamam `drainSaves()` e só leem o
 * disco depois de toda gravação pendente terminar.
 */
export function saveCurrentDocument(): Promise<void> {
  return enqueueSave(async () => {
    const docStore = useDocumentStore.getState()
    const ed = useEditorStore.getState().editor
    if (!ed || ed.isDestroyed) return

    try {
      const pmDoc = ed.getJSON()
      const originalParts = docStore.originalParts || new Map()
      const doc = proseMirrorToDocx(pmDoc, originalParts)
      const bytes = await exportDocx(doc)
      if (bytes.byteLength === 0) {
        throw new Error('Exportação gerou conteúdo vazio')
      }

      if (docStore.filePath) {
        // Documento já existe no disco: salva diretamente sem abrir diálogo.
        // Não usar `?.` aqui: falha silenciosa faria o app marcar como salvo sem gravar.
        if (!window.api?.fs?.writeFile) {
          throw new Error('API de arquivos indisponível (preload não carregado)')
        }
        await window.api.fs.writeFile(docStore.filePath, bytes)
        // Guarda: se o usuário trocou de documento durante a gravação, não chamar
        // markSaved — ele reverteria filePath/dirty do documento aberto agora.
        if (useDocumentStore.getState().filePath === docStore.filePath) {
          docStore.markSaved(docStore.filePath)
        }
        useRecentFilesStore.getState().addFile({
          path: docStore.filePath,
          name: docStore.fileName,
          lastOpened: new Date().toLocaleDateString('pt-BR')
        })
      } else {
        // Documento novo (sem caminho): abre diálogo de salvar
        const defaultPath = `${docStore.fileName}.docx`
        const savedPath = await window.api?.dialog.saveDocx(defaultPath, bytes)
        if (savedPath) {
          // Mesma guarda do ramo direto: só marca salvo se este ainda for o documento atual.
          if (useDocumentStore.getState().filePath === docStore.filePath) {
            docStore.markSaved(savedPath)
          }
          useRecentFilesStore.getState().addFile({
            path: savedPath,
            name: docStore.fileName,
            lastOpened: new Date().toLocaleDateString('pt-BR')
          })
        }
      }
    } catch (err) {
      console.error('Erro ao salvar documento:', err)
      alert(`Erro ao salvar documento:\n${err instanceof Error ? err.message : String(err)}`)
    }
  })
}

/** Salva uma cópia em outro caminho (diálogo "Salvar como"). */
export function saveCurrentDocumentAs(): Promise<void> {
  return enqueueSave(async () => {
    const docStore = useDocumentStore.getState()
    const ed = useEditorStore.getState().editor
    if (!ed || ed.isDestroyed) return

    try {
      const pmDoc = ed.getJSON()
      const originalParts = docStore.originalParts || new Map()
      const doc = proseMirrorToDocx(pmDoc, originalParts)
      const bytes = await exportDocx(doc)
      const defaultPath = docStore.filePath || `${docStore.fileName}.docx`
      const savedPath = await window.api?.dialog.saveDocx(defaultPath, bytes)
      if (savedPath) {
        if (useDocumentStore.getState().filePath === docStore.filePath) {
          docStore.markSaved(savedPath)
        }
        useRecentFilesStore.getState().addFile({
          path: savedPath,
          name: docStore.fileName,
          lastOpened: new Date().toLocaleDateString('pt-BR')
        })
      }
    } catch (err) {
      console.error('Erro ao salvar como:', err)
      alert(`Erro ao salvar como:\n${err instanceof Error ? err.message : String(err)}`)
    }
  })
}
