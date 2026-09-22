import { useEditorUiStore } from '../../stores/useEditorUiStore'
import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'

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
          icon="💬"
          label="Comentários"
          size="lg"
          active={showCommentsPane}
          onClick={toggleCommentsPane}
          title="Painel de comentários"
        />
      </RibbonGroup>
      <RibbonGroup label="Sumário">
        <RibbonButton
          icon="📑"
          label="Sumário"
          size="lg"
          active={showTocPane}
          onClick={toggleTocPane}
          title="Painel de sumário"
        />
      </RibbonGroup>
      <RibbonGroup label="Edição">
        <RibbonButton
          icon="🔍"
          label="Localizar"
          size="lg"
          onClick={() => setFindReplaceMode('find')}
          title="Localizar (Ctrl+F)"
        />
        <RibbonButton
          icon="🔄"
          label="Substituir"
          size="lg"
          onClick={() => setFindReplaceMode('replace')}
          title="Substituir (Ctrl+H)"
        />
      </RibbonGroup>
    </div>
  )
}
