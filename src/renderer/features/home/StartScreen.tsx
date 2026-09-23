import { useRecentFilesStore } from '../../stores/useRecentFilesStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import {
  ArrowLeft,
  FilePlus,
  FolderOpen,
  Save,
  SaveAll,
  FileDown,
  Printer,
  FileText,
  Clock,
  Sun,
  Moon,
  Trash2
} from 'lucide-react'

interface Props {
  onClose: () => void
  onNew: () => void
  onOpen: () => void
  onSave: () => void
  onSaveAs: () => void
  onExportPdf: () => void
  onPrint: () => void
  onOpenRecent: (path: string) => void
}

export function StartScreen({
  onClose,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onExportPdf,
  onPrint,
  onOpenRecent
}: Props) {
  const { files, clear } = useRecentFilesStore()
  const { theme, setTheme } = useSettingsStore()

  return (
    <div className="fixed inset-0 z-50 flex bg-white text-neutral-800 animate-in fade-in duration-150">
      {/* Barra lateral de navegação Office Backstage */}
      <div className="flex w-64 flex-col bg-office-blue text-white shadow-xl">
        {/* Botão de retorno ao documento */}
        <div className="p-4 border-b border-office-blue-dark/50">
          <button
            className="flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 active:scale-95"
            onClick={onClose}
            title="Voltar para a edição do documento"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Documento</span>
          </button>
        </div>

        {/* Menu de Ações */}
        <div className="flex flex-col gap-1 p-3">
          <button
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-office-blue-dark active:bg-office-blue-dark/80"
            onClick={onNew}
          >
            <FilePlus className="h-4 w-4 text-blue-200" />
            <span>Novo</span>
          </button>
          <button
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-office-blue-dark active:bg-office-blue-dark/80"
            onClick={onOpen}
          >
            <FolderOpen className="h-4 w-4 text-amber-300" />
            <span>Abrir…</span>
          </button>
          <button
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-office-blue-dark active:bg-office-blue-dark/80"
            onClick={onSave}
          >
            <Save className="h-4 w-4 text-blue-200" />
            <span>Salvar</span>
          </button>
          <button
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-office-blue-dark active:bg-office-blue-dark/80"
            onClick={onSaveAs}
          >
            <SaveAll className="h-4 w-4 text-blue-200" />
            <span>Salvar como…</span>
          </button>
          <div className="my-2 border-t border-white/15" />
          <button
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-office-blue-dark active:bg-office-blue-dark/80"
            onClick={onExportPdf}
          >
            <FileDown className="h-4 w-4 text-red-300" />
            <span>Exportar PDF…</span>
          </button>
          <button
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-office-blue-dark active:bg-office-blue-dark/80"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4 text-blue-200" />
            <span>Imprimir…</span>
          </button>
        </div>

        {/* Rodapé com Tema */}
        <div className="mt-auto border-t border-office-blue-dark/50 p-4">
          <button
            className="flex w-full items-center justify-between rounded-md bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <span className="flex items-center gap-2">
              {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal (Modelos e Recentes) */}
      <div className="flex-1 overflow-auto bg-neutral-50 p-10">
        <div className="max-w-4xl">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-800">Novo</h2>
          <div className="mb-10 flex gap-4">
            {/* Cartão de Documento em Branco estilo Office */}
            <button
              className="group flex flex-col items-center rounded-lg border-2 border-transparent bg-white p-4 shadow-sm transition-all hover:border-office-blue hover:shadow-md active:scale-98"
              onClick={onNew}
            >
              <div className="mb-3 flex h-36 w-28 flex-col items-center justify-center rounded border border-neutral-200 bg-white shadow-xs group-hover:border-blue-300">
                <FilePlus className="h-8 w-8 stroke-1 text-office-blue" />
              </div>
              <span className="text-xs font-medium text-neutral-700 group-hover:text-office-blue">
                Documento em branco
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">Recentes</h3>
            {files.length > 0 && (
              <button
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600 transition-colors"
                onClick={clear}
              >
                <Trash2 className="h-3 w-3" />
                Limpar recentes
              </button>
            )}
          </div>

          {files.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
              <Clock className="mx-auto mb-2 h-6 w-6 text-neutral-300" />
              Nenhum documento aberto recentemente.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {files.map((f) => (
                <button
                  key={f.path}
                  className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-xs transition-colors hover:border-blue-300 hover:bg-blue-50/50"
                  onClick={() => onOpenRecent(f.path)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-100 text-office-blue">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-neutral-800">{f.name}</div>
                    <div className="truncate text-[10px] text-neutral-400 mt-0.5">{f.path}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">
                      Aberto em: {f.lastOpened}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
