import { useEditorUiStore } from '../../stores/useEditorUiStore'
import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'
import { MessageSquare, ListTree, Search, Replace } from 'lucide-react'

export function ReviewTab() {
  const {
    toggleCommentsPane,
    toggleTocPane,
    showCommentsPane,
    showTocPane,
    setFindReplaceMode
  } = useEditorUiStore()

  return (
    <div className="flex items-stretch gap-0">
      <RibbonGroup label="Comentários">
        <RibbonButton
          icon={<MessageSquare className="h-5 w-5 text-office-blue" />}
          label="Comentários"
          size="lg"
          active={showCommentsPane}
          onClick={toggleCommentsPane}
          title="Abrir ou fechar painel de comentários"
        />
      </RibbonGroup>

      <RibbonGroup label="Sumário">
        <RibbonButton
          icon={<ListTree className="h-5 w-5 text-office-blue" />}
          label="Sumário"
          size="lg"
          active={showTocPane}
          onClick={toggleTocPane}
          title="Abrir ou fechar sumário de títulos"
        />
      </RibbonGroup>

      <RibbonGroup label="Edição">
        <RibbonButton
          icon={<Search className="h-5 w-5 text-neutral-700" />}
          label="Localizar"
          size="lg"
          onClick={() => setFindReplaceMode('find')}
          title="Localizar texto no documento (Ctrl+F)"
        />
        <RibbonButton
          icon={<Replace className="h-5 w-5 text-neutral-700" />}
          label="Substituir"
          size="lg"
          onClick={() => setFindReplaceMode('replace')}
          title="Substituir texto no documento (Ctrl+H)"
        />
      </RibbonGroup>
    </div>
  )
}
