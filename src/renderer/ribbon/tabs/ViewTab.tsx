import { useEditorUiStore } from '../../stores/useEditorUiStore'
import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'
import { Ruler, Sparkles, MessageSquare, ListTree, ZoomIn, ZoomOut, Maximize } from 'lucide-react'

export function ViewTab() {
  const {
    showRuler,
    toggleRuler,
    showStylesPane,
    toggleStylesPane,
    showCommentsPane,
    toggleCommentsPane,
    showTocPane,
    toggleTocPane,
    zoom,
    setZoom
  } = useEditorUiStore()

  return (
    <div className="flex items-stretch gap-0">
      <RibbonGroup label="Mostrar">
        <RibbonButton
          icon={<Ruler className="h-5 w-5 text-neutral-700" />}
          label="Régua"
          size="lg"
          active={showRuler}
          onClick={toggleRuler}
          title="Mostrar ou ocultar régua"
        />
        <RibbonButton
          icon={<ListTree className="h-5 w-5 text-neutral-700" />}
          label="Sumário"
          size="lg"
          active={showTocPane}
          onClick={toggleTocPane}
          title="Painel de navegação por títulos"
        />
      </RibbonGroup>

      <RibbonGroup label="Painéis">
        <RibbonButton
          icon={<Sparkles className="h-5 w-5 text-office-blue" />}
          label="Estilos"
          size="lg"
          active={showStylesPane}
          onClick={toggleStylesPane}
          title="Painel lateral de estilos"
        />
        <RibbonButton
          icon={<MessageSquare className="h-5 w-5 text-office-blue" />}
          label="Comentários"
          size="lg"
          active={showCommentsPane}
          onClick={toggleCommentsPane}
          title="Painel de comentários"
        />
      </RibbonGroup>

      <RibbonGroup label="Zoom">
        <RibbonButton
          icon={<Maximize className="h-5 w-5 text-neutral-700" />}
          label="100%"
          size="lg"
          onClick={() => setZoom(100)}
          title="Restaurar zoom para 100%"
        />
        <div className="flex flex-col">
          <RibbonButton
            icon={<ZoomIn className="h-3.5 w-3.5" />}
            title="Aumentar zoom (+10%)"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          />
          <RibbonButton
            icon={<ZoomOut className="h-3.5 w-3.5" />}
            title="Diminuir zoom (-10%)"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          />
        </div>
      </RibbonGroup>
    </div>
  )
}
