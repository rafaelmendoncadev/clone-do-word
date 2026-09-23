import { useEffect, useState, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { createEditorExtensions } from './extensions/schema'
import { useEditorStore } from '../stores/useEditorStore'
import { useDocumentStore } from '../stores/useDocumentStore'
import { useEditorUiStore } from '../stores/useEditorUiStore'
import { useDocumentLayoutStore } from '../stores/useDocumentLayoutStore'
import { countWords } from '@shared/lib/format'
import { Page } from './Page'
import { PageSetupDialog } from './PageSetupDialog'
import { getPageDimensions } from './page-setup'
import { StylesPane } from '../features/styles-pane/StylesPane'
import { CommentsPane } from '../features/comments/CommentsPane'
import { TocPanel } from '../features/toc-panel/TocPanel'
import { FindReplacePanel } from '../features/find-replace/FindReplacePanel'

const EDITOR_ATTRIBUTES = { class: 'doc-content outline-none' }

export function EditorCanvas() {
  const {
    zoom,
    showRuler,
    showStylesPane,
    showCommentsPane,
    showTocPane,
    showFindReplace,
    findReplaceMode,
    toggleCommentsPane,
    toggleTocPane,
    toggleFindReplace
  } = useEditorUiStore()
  const setWordCount = useDocumentStore((s) => s.setWordCount)
  const setDirty = useDocumentStore((s) => s.setDirty)
  const setEditor = useEditorStore((s) => s.setEditor)
  const { setup, headerFooter, setupDialogOpen, setSetupDialogOpen, setSetup, setHeaderFooter } =
    useDocumentLayoutStore()
  const [totalPages] = useState(1)

  // Referência estável: evita setOptions a cada render do useEditor
  const extensions = useMemo(() => createEditorExtensions(), [])
  const editorProps = useMemo(() => ({ attributes: EDITOR_ATTRIBUTES }), [])

  const editor = useEditor({
    extensions,
    content: '<p>Comece a digitar seu documento…</p>',
    editorProps,
    onUpdate: ({ editor: e }) => {
      setWordCount(countWords(e.getText()))
      setDirty(true)
    }
  })

  // Sincroniza o store com a instância viva do useEditor.
  // Não usar onDestroy → setEditor(null) incondicional: no StrictMode a instância
  // antiga destrói depois da nova nascer e apaga o editor válido.
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      setEditor(editor)
    }
    return () => {
      if (useEditorStore.getState().editor === editor) {
        setEditor(null)
      }
    }
  }, [editor, setEditor])

  const dims = getPageDimensions(setup)

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto bg-neutral-200 p-6">
        {showRuler && (
          <div
            className="mx-auto mb-2 h-5 border border-neutral-300 bg-white text-[9px] text-neutral-400"
            style={{ width: dims.widthPx * (zoom / 100) }}
          >
            <div className="flex h-full items-center justify-around">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
          </div>
        )}
        <Page
          pageNumber={1}
          totalPages={totalPages}
          setup={dims}
          margins={setup.margins}
          header={headerFooter.header}
          footer={headerFooter.footer}
          zoom={zoom}
        >
          <div className="select-text cursor-text">
            <EditorContent editor={editor} />
          </div>
        </Page>
      </div>
      {showStylesPane && <StylesPane />}
      {showCommentsPane && <CommentsPane open onClose={toggleCommentsPane} />}
      {showTocPane && <TocPanel open onClose={toggleTocPane} />}
      {showFindReplace && (
        <FindReplacePanel open onClose={toggleFindReplace} mode={findReplaceMode} />
      )}
      <PageSetupDialog
        open={setupDialogOpen}
        setup={setup}
        headerFooter={headerFooter}
        onClose={() => setSetupDialogOpen(false)}
        onApply={(s, hf) => {
          setSetup(s)
          setHeaderFooter(hf)
        }}
      />
    </div>
  )
}
