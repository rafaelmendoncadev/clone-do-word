import { useRecentFilesStore } from '../../stores/useRecentFilesStore'
import { useSettingsStore } from '../../stores/useSettingsStore'

interface Props {
  onNew: () => void
  onOpen: () => void
  onOpenRecent: (path: string) => void
}

export function StartScreen({ onNew, onOpen, onOpenRecent }: Props) {
  const { files } = useRecentFilesStore()
  const { theme, setTheme } = useSettingsStore()

  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      <div className="flex w-64 flex-col bg-office-blue p-6 text-white">
        <h1 className="mb-8 text-2xl font-bold">Clone do Word</h1>
        <button className="mb-2 rounded px-3 py-2 text-left hover:bg-office-blue-dark" onClick={onNew}>
          Novo documento
        </button>
        <button className="mb-2 rounded px-3 py-2 text-left hover:bg-office-blue-dark" onClick={onOpen}>
          Abrir…
        </button>
        <div className="mt-auto">
          <button
            className="rounded px-3 py-2 text-left text-sm hover:bg-office-blue-dark"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-8">
        <h2 className="mb-4 text-lg font-semibold">Recentes</h2>
        {files.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum arquivo recente.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {files.map((f) => (
              <button
                key={f.path}
                className="rounded-lg border border-neutral-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50"
                onClick={() => onOpenRecent(f.path)}
              >
                <div className="mb-1 font-medium">{f.name}</div>
                <div className="text-xs text-neutral-500">
                  {new Date(f.lastOpened).toLocaleDateString('pt-BR')}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
