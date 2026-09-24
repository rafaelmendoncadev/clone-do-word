import { useEffect, useCallback } from 'react'
import { AppShell } from './layout/AppShell'
import { ErrorBoundary } from './layout/ErrorBoundary'
import { useDocumentStore } from './stores/useDocumentStore'
import { useEditorStore } from './stores/useEditorStore'
import { useEditorUiStore } from './stores/useEditorUiStore'
import { useDocumentLayoutStore } from './stores/useDocumentLayoutStore'
import { saveCurrentDocument, saveCurrentDocumentAs } from './lib/save-docx'
import { openDocxIntoEditor, openRecentPath } from './lib/open-docx'
import { StartScreen } from './features/home/StartScreen'

export default function App() {
  const setVersion = useDocumentStore((s) => s.setAppVersion)
  const { showBackstage, setBackstage, setFindReplaceMode } = useEditorUiStore()
  const editor = useEditorStore((s) => s.editor)

  useEffect(() => {
    window.api?.app.getVersion().then(setVersion)
  }, [setVersion])

  // Os saves são serializados dentro de save-docx.ts (enqueueSave): abrir/trocar
  // de arquivo aguarda a gravação pendente (drainSaves) antes de ler o disco.
  const handleSave = useCallback(async () => {
    await saveCurrentDocument()
  }, [])

  const handleSaveAs = useCallback(async () => {
    await saveCurrentDocumentAs()
  }, [])

  useEffect(() => {
    const onAppSave = () => {
      void handleSave()
    }
    window.addEventListener('app:save', onAppSave)
    return () => window.removeEventListener('app:save', onAppSave)
  }, [handleSave])

  /**
   * Executa impressão/exportação com zoom 100: o tamanho da folha é calculado
   * a partir do zoom e sairia distorcido no PDF se o usuário estiver com zoom
   * diferente. Restaura o zoom original ao final.
   */
  const withPrintZoom = useCallback(async <T,>(run: () => Promise<T>): Promise<T> => {
    const prevZoom = useEditorUiStore.getState().zoom
    if (prevZoom !== 100) useEditorUiStore.getState().setZoom(100)
    // aguarda o React reaplicar as dimensões da folha antes de capturar
    await new Promise((r) => setTimeout(r, 80))
    try {
      return await run()
    } finally {
      if (prevZoom !== 100) useEditorUiStore.getState().setZoom(prevZoom)
    }
  }, [])

  const handleExportPdf = useCallback(async () => {
    // Fecha o backstage antes: se estivesse aberto, o printToPDF capturaria a tela.
    useEditorUiStore.getState().setBackstage(false)
    const docStore = useDocumentStore.getState()
    const { headerFooter } = useDocumentLayoutStore.getState()
    const defaultPath = docStore.filePath || `${docStore.fileName}.docx`
    await withPrintZoom(
      () =>
        window.api?.print.exportPdf(defaultPath, headerFooter.header, headerFooter.footer) ??
        Promise.resolve(null)
    )
  }, [withPrintZoom])

  const handlePrint = useCallback(async () => {
    useEditorUiStore.getState().setBackstage(false)
    await withPrintZoom(() => window.api?.print.document() ?? Promise.resolve())
  }, [withPrintZoom])

  useEffect(() => {
    const unsubscribe = window.api?.menu.onAction(async (action) => {
      const docStore = useDocumentStore.getState()
      const currentEditor = useEditorStore.getState().editor

      switch (action) {
        case 'file.new': {
          docStore.newDocument()
          currentEditor?.commands.setContent('<p></p>')
          setBackstage(false)
          break
        }
        case 'file.open': {
          setBackstage(false)
          await openDocxIntoEditor(currentEditor)
          break
        }
        case 'file.save': {
          await handleSave()
          break
        }
        case 'file.saveAs': {
          await handleSaveAs()
          break
        }
        case 'file.exportPdf': {
          await handleExportPdf()
          break
        }
        case 'file.print': {
          await handlePrint()
          break
        }
        case 'edit.find': {
          setFindReplaceMode('find')
          break
        }
        case 'edit.replace': {
          setFindReplaceMode('replace')
          break
        }
        case 'help.about': {
          alert(`Clone do Word v${docStore.appVersion}\nEditor de texto avançado com suporte a .docx`)
          break
        }
      }
    })
    return () => unsubscribe?.()
  }, [handleSave, handleSaveAs, handleExportPdf, handlePrint, setBackstage, setFindReplaceMode])

  return (
    <ErrorBoundary>
      <AppShell />
      {showBackstage && (
        <StartScreen
          onClose={() => setBackstage(false)}
          onNew={() => {
            const docStore = useDocumentStore.getState()
            docStore.newDocument()
            editor?.commands.setContent('<p></p>')
            setBackstage(false)
          }}
          onOpen={async () => {
            setBackstage(false)
            await openDocxIntoEditor(editor)
          }}
          onSave={async () => {
            await handleSave()
            setBackstage(false)
          }}
          onSaveAs={async () => {
            await handleSaveAs()
            setBackstage(false)
          }}
          onExportPdf={async () => {
            await handleExportPdf()
            setBackstage(false)
          }}
          onPrint={async () => {
            await handlePrint()
            setBackstage(false)
          }}
          onOpenRecent={async (path) => {
            const ok = await openRecentPath(path, editor)
            if (ok) setBackstage(false)
          }}
        />
      )}
    </ErrorBoundary>
  )
}
