import { useEditorStore } from '../../stores/useEditorStore'
import { useEditorUiStore } from '../../stores/useEditorUiStore'
import { X, Sparkles } from 'lucide-react'

const STYLES = [
  { name: 'Normal', tag: 'paragraph', className: 'text-neutral-800' },
  { name: 'Título 1', tag: 'heading', level: 1, className: 'text-lg font-bold text-office-blue' },
  { name: 'Título 2', tag: 'heading', level: 2, className: 'text-base font-bold text-office-blue' },
  { name: 'Título 3', tag: 'heading', level: 3, className: 'text-sm font-semibold text-neutral-800' },
  { name: 'Citação', tag: 'blockquote', className: 'italic text-neutral-600 border-l-2 border-office-blue pl-2' }
]

export function StylesPane() {
  const editor = useEditorStore((s) => s.editor)
  const toggleStylesPane = useEditorUiStore((s) => s.toggleStylesPane)

  if (!editor) return null

  const applyStyle = (style: (typeof STYLES)[number]) => {
    if (style.tag === 'paragraph') editor.chain().focus().setParagraph().run()
    else if (style.tag === 'heading') editor.chain().focus().setHeading({ level: style.level as 1 | 2 | 3 }).run()
    else if (style.tag === 'blockquote') editor.chain().focus().toggleBlockquote().run()
  }

  const isActive = (style: (typeof STYLES)[number]) => {
    if (style.tag === 'paragraph') return !editor.isActive('heading') && !editor.isActive('blockquote')
    return editor.isActive(style.tag)
  }

  return (
    <div className="w-56 border-l border-neutral-200 bg-white p-3 shadow-sm flex flex-col">
      <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
          <Sparkles className="h-3.5 w-3.5 text-office-blue" />
          <span>PAINEL DE ESTILOS</span>
        </div>
        <button
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          onClick={toggleStylesPane}
          title="Fechar painel de estilos"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-auto flex-1">
        {STYLES.map((style) => (
          <button
            key={style.name}
            className={`rounded-md border p-2 text-left transition-colors ${
              isActive(style)
                ? 'border-blue-300 bg-blue-50/70 font-medium'
                : 'border-neutral-200 hover:border-blue-200 hover:bg-neutral-50'
            }`}
            onClick={() => applyStyle(style)}
          >
            <div className={style.className}>{style.name}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {style.tag === 'heading' ? `Estilo de Título ${style.level}` : style.tag}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
