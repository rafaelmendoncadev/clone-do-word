import { useEditorStore } from '../../stores/useEditorStore'

const STYLES = [
  { name: 'Normal', tag: 'paragraph', className: '' },
  { name: 'Título 1', tag: 'heading', level: 1, className: 'text-xl font-bold text-office-blue' },
  { name: 'Título 2', tag: 'heading', level: 2, className: 'text-lg font-bold text-office-blue' },
  { name: 'Título 3', tag: 'heading', level: 3, className: 'text-base font-semibold' },
  { name: 'Citação', tag: 'blockquote', className: 'italic text-neutral-600 border-l-2 border-office-blue pl-2' }
]

export function StylesPane() {
  const editor = useEditorStore((s) => s.editor)
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
    <div className="w-48 border-l border-neutral-200 bg-neutral-50 p-2">
      <h3 className="mb-2 text-xs font-semibold text-neutral-500">ESTILOS</h3>
      <div className="flex flex-col gap-1">
        {STYLES.map((style) => (
          <button
            key={style.name}
            className={`rounded px-2 py-1.5 text-left text-sm ${style.className} ${
              isActive(style) ? 'bg-blue-100' : 'hover:bg-neutral-100'
            }`}
            onClick={() => applyStyle(style)}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  )
}
