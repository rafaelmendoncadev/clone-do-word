import { useEffect } from 'react'
import { AppShell } from './layout/AppShell'
import { ErrorBoundary } from './layout/ErrorBoundary'
import { useDocumentStore } from './stores/useDocumentStore'
import { useEditorStore } from './stores/useEditorStore'
import { exportDocx, proseMirrorToDocx } from '../docx'
import { openDocxIntoEditor } from './lib/open-docx'

export default function App() {
  const setVersion = useDocumentStore((s) => s.setAppVersion)

  useEffect(() => {
    window.api?.app.getVersion().then(setVersion)
  }, [setVersion])

  useEffect(() => {
    const unsubscribe = window.api?.menu.onAction(async (action) => {
      const docStore = useDocumentStore.getState()
      const editorStore = useEditorStore.getState()
      const editor = editorStore.editor

      switch (action) {
        case 'file.new': {
          docStore.newDocument()
          editor?.commands.setContent('<p></p>')
          break
        }
        case 'file.open': {
          await openDocxIntoEditor(editor)
          break
        }
        case 'file.save':
        case 'file.saveAs': {
          if (!editor) break
          const pmDoc = editor.getJSON()
          const originalParts = new Map() // TODO: preservar do import
          const doc = proseMirrorToDocx(pmDoc, originalParts)
          const bytes = await exportDocx(doc)
          const defaultPath = docStore.filePath || `${docStore.fileName}.docx`
          const savedPath = await window.api?.dialog.saveDocx(defaultPath, bytes)
          if (savedPath) {
            docStore.markSaved(savedPath)
          }
          break
        }
        case 'help.about': {
          alert(`Clone do Word v${docStore.appVersion}\nEditor de texto avançado com suporte a .docx`)
          break
        }
      }
    })
    return () => unsubscribe?.()
  }, [])

  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  )
}
