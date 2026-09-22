import { useDocumentLayoutStore } from '../../stores/useDocumentLayoutStore'
import { useEditorUiStore } from '../../stores/useEditorUiStore'
import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'

export function LayoutTab() {
  const setSetupDialogOpen = useDocumentLayoutStore((s) => s.setSetupDialogOpen)
  const { toggleRuler, showRuler } = useEditorUiStore()

  return (
    <div className="flex items-stretch gap-0">
      <RibbonGroup label="Configurar Página">
        <RibbonButton icon="📐" label="Margens" size="lg" onClick={() => setSetupDialogOpen(true)} title="Margens e orientação" />
      </RibbonGroup>
      <RibbonGroup label="Colunas">
        <RibbonButton icon="▮" label="1 col." size="lg" title="Uma coluna" />
        <RibbonButton icon="▮▮" label="2 col." size="lg" title="Duas colunas" />
        <RibbonButton icon="▮▮▮" label="3 col." size="lg" title="Três colunas" />
      </RibbonGroup>
      <RibbonGroup label="Exibir">
        <RibbonButton icon="📏" label="Régua" size="lg" active={showRuler} onClick={toggleRuler} title="Mostrar/ocultar régua" />
      </RibbonGroup>
    </div>
  )
}
