import { useEditorUiStore } from '../stores/useEditorUiStore'
import { cn } from '@shared/lib/format'
import { HomeTab } from './tabs/HomeTab'
import { InsertTab } from './tabs/InsertTab'
import { LayoutTab } from './tabs/LayoutTab'
import { ReferencesTab } from './tabs/ReferencesTab'
import { ReviewTab } from './tabs/ReviewTab'
import { ViewTab } from './tabs/ViewTab'

const TABS = [
  { id: 'home', label: 'Página Inicial' },
  { id: 'insert', label: 'Inserir' },
  { id: 'layout', label: 'Layout' },
  { id: 'references', label: 'Referências' },
  { id: 'review', label: 'Revisão' },
  { id: 'view', label: 'Exibir' }
]

export function Ribbon() {
  const { activeRibbonTab, setActiveRibbonTab, toggleBackstage } = useEditorUiStore()

  return (
    <div className="border-b border-neutral-200 bg-neutral-50 shadow-xs print:hidden">
      <div className="flex items-center gap-0 px-2 pt-1">
        {/* Botão de Destaque Arquivo (Backstage) */}
        <button
          className="mr-1.5 rounded-t bg-office-blue px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-office-blue-dark active:scale-95"
          onClick={toggleBackstage}
          title="Abrir menu Arquivo (Backstage)"
        >
          Arquivo
        </button>

        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'rounded-t px-3.5 py-1.5 text-xs font-medium transition-colors',
              activeRibbonTab === tab.id
                ? 'border border-b-0 border-neutral-200 bg-white font-semibold text-office-blue'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            )}
            onClick={() => setActiveRibbonTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-[88px] border-t border-neutral-200 bg-white px-3 py-1">
        {activeRibbonTab === 'home' && <HomeTab />}
        {activeRibbonTab === 'insert' && <InsertTab />}
        {activeRibbonTab === 'layout' && <LayoutTab />}
        {activeRibbonTab === 'references' && <ReferencesTab />}
        {activeRibbonTab === 'review' && <ReviewTab />}
        {activeRibbonTab === 'view' && <ViewTab />}
      </div>
    </div>
  )
}
