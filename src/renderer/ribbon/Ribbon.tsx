import { useEditorUiStore } from '../stores/useEditorUiStore'
import { cn } from '@shared/lib/format'
import { HomeTab } from './tabs/HomeTab'
import { InsertTab } from './tabs/InsertTab'
import { LayoutTab } from './tabs/LayoutTab'
import { ReviewTab } from './tabs/ReviewTab'

const TABS = [
  { id: 'home', label: 'Página Inicial' },
  { id: 'insert', label: 'Inserir' },
  { id: 'layout', label: 'Layout' },
  { id: 'references', label: 'Referências' },
  { id: 'review', label: 'Revisão' },
  { id: 'view', label: 'Exibir' }
]

export function Ribbon() {
  const { activeRibbonTab, setActiveRibbonTab } = useEditorUiStore()

  return (
    <div className="border-b border-neutral-200 bg-neutral-50">
      <div className="flex items-center gap-0 px-2 pt-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'rounded-t px-3 py-1.5 text-sm font-medium transition-colors',
              activeRibbonTab === tab.id
                ? 'border border-b-0 border-neutral-200 bg-white text-office-blue'
                : 'text-neutral-600 hover:bg-neutral-100'
            )}
            onClick={() => setActiveRibbonTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-[90px] border-t border-neutral-200 bg-white px-2 py-1">
        {activeRibbonTab === 'home' && <HomeTab />}
        {activeRibbonTab === 'insert' && <InsertTab />}
        {activeRibbonTab === 'layout' && <LayoutTab />}
        {activeRibbonTab === 'review' && <ReviewTab />}
        {!['home', 'insert', 'layout', 'review'].includes(activeRibbonTab) && (
          <div className="flex h-[80px] items-center justify-center text-sm text-neutral-400">Em breve…</div>
        )}
      </div>
    </div>
  )
}
