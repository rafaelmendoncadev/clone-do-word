import { useEditorUiStore } from '../../stores/useEditorUiStore'
import { useEditorStore } from '../../stores/useEditorStore'
import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'
import { ListTree, Heading1, Heading2, Heading3 } from 'lucide-react'
import { setHeading } from '../../lib/editor-commands'

export function ReferencesTab() {
  const editor = useEditorStore((s) => s.editor)
  const { showTocPane, toggleTocPane } = useEditorUiStore()

  if (!editor) return <div className="h-[80px]" />

  return (
    <div className="flex items-stretch gap-0">
      <RibbonGroup label="Sumário">
        <RibbonButton
          icon={<ListTree className="h-5 w-5 text-office-blue" />}
          label="Sumário"
          size="lg"
          active={showTocPane}
          onClick={toggleTocPane}
          title="Abrir painel de sumário"
        />
      </RibbonGroup>

      <RibbonGroup label="Níveis de Título">
        <RibbonButton
          icon={<Heading1 className="h-5 w-5 text-office-blue" />}
          label="Nível 1"
          size="lg"
          onClick={() => setHeading(editor, 1)}
          title="Aplicar Título 1"
        />
        <RibbonButton
          icon={<Heading2 className="h-5 w-5 text-office-blue" />}
          label="Nível 2"
          size="lg"
          onClick={() => setHeading(editor, 2)}
          title="Aplicar Título 2"
        />
        <RibbonButton
          icon={<Heading3 className="h-5 w-5 text-neutral-700" />}
          label="Nível 3"
          size="lg"
          onClick={() => setHeading(editor, 3)}
          title="Aplicar Título 3"
        />
      </RibbonGroup>
    </div>
  )
}
