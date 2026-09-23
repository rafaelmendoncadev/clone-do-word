import { useDocumentLayoutStore } from '../../stores/useDocumentLayoutStore'
import { useEditorUiStore } from '../../stores/useEditorUiStore'
import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'
import { SlidersHorizontal, Ruler, FileText, Smartphone } from 'lucide-react'

export function LayoutTab() {
  const { setup, setSetup, setSetupDialogOpen } = useDocumentLayoutStore()
  const { toggleRuler, showRuler } = useEditorUiStore()

  const setOrientation = (orientation: 'portrait' | 'landscape') => {
    setSetup({ ...setup, orientation })
  }

  return (
    <div className="flex items-stretch gap-0">
      <RibbonGroup label="Configurar Página">
        <RibbonButton
          icon={<SlidersHorizontal className="h-5 w-5 text-office-blue" />}
          label="Margens"
          size="lg"
          onClick={() => setSetupDialogOpen(true)}
          title="Configuração avançada de margens e tamanho"
        />
      </RibbonGroup>

      <RibbonGroup label="Orientação">
        <div className="flex gap-1">
          <RibbonButton
            icon={<Smartphone className="h-4 w-4" />}
            label="Retrato"
            size="lg"
            active={setup.orientation === 'portrait'}
            onClick={() => setOrientation('portrait')}
            title="Orientação Retrato (Vertical)"
          />
          <RibbonButton
            icon={<FileText className="h-4 w-4 rotate-90" />}
            label="Paisagem"
            size="lg"
            active={setup.orientation === 'landscape'}
            onClick={() => setOrientation('landscape')}
            title="Orientação Paisagem (Horizontal)"
          />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Exibir">
        <RibbonButton
          icon={<Ruler className="h-5 w-5 text-neutral-600" />}
          label="Régua"
          size="lg"
          active={showRuler}
          onClick={toggleRuler}
          title="Mostrar ou ocultar régua superior"
        />
      </RibbonGroup>
    </div>
  )
}
