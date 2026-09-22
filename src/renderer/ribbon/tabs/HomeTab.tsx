import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'
import { useEditorStore } from '../../stores/useEditorStore'
import { openDocxIntoEditor } from '../../lib/open-docx'
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrike,
  setFontFamily,
  setTextColor,
  setHighlight,
  setTextAlign,
  toggleBulletList,
  toggleOrderedList,
  undo,
  redo
} from '../../lib/editor-commands'

const FONTS = [
  'Calibri',
  'Arial',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia',
  'Tahoma'
]

const SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '36']

export function HomeTab() {
  const editor = useEditorStore((s) => s.editor)

  if (!editor) return <div className="h-[80px]" />

  const isActive = (name: string) => editor.isActive(name)

  return (
    <div className="flex items-stretch gap-0">
      {/* Arquivo */}
      <RibbonGroup label="Arquivo">
        <RibbonButton
          icon="📂"
          label="Abrir"
          size="lg"
          title="Abrir documento .docx (Ctrl+O)"
          onClick={() => void openDocxIntoEditor(editor)}
        />
      </RibbonGroup>

      {/* Área de Transferência */}
      <RibbonGroup label="Área de Transferência">
        <RibbonButton icon="📋" label="Colar" size="lg" />
        <div className="flex flex-col">
          <RibbonButton icon="✂️" title="Recortar" onClick={() => document.execCommand('cut')} />
          <RibbonButton icon="📄" title="Copiar" onClick={() => document.execCommand('copy')} />
        </div>
      </RibbonGroup>

      {/* Fonte */}
      <RibbonGroup label="Fonte">
        <div className="flex items-center gap-1">
          <select
            className="h-7 w-32 rounded border border-neutral-300 px-1 text-xs"
            value={editor.getAttributes('textStyle').fontFamily || 'Calibri'}
            onChange={(e) => setFontFamily(editor, e.target.value)}
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            className="h-7 w-14 rounded border border-neutral-300 px-1 text-xs"
            onChange={(e) => {
              const size = e.target.value
              editor.chain().focus().setMark('textStyle', { fontSize: `${size}pt` }).run()
            }}
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-0.5">
            <RibbonButton
              icon={<b>B</b>}
              title="Negrito (Ctrl+B)"
              active={isActive('bold')}
              onClick={() => toggleBold(editor)}
            />
            <RibbonButton
              icon={<i>I</i>}
              title="Itálico (Ctrl+I)"
              active={isActive('italic')}
              onClick={() => toggleItalic(editor)}
            />
            <RibbonButton
              icon={<u>U</u>}
              title="Sublinhado (Ctrl+U)"
              active={isActive('underline')}
              onClick={() => toggleUnderline(editor)}
            />
            <RibbonButton
              icon={<s>S</s>}
              title="Tachado"
              active={isActive('strike')}
              onClick={() => toggleStrike(editor)}
            />
          </div>
          <div className="flex gap-0.5">
            <label className="relative" title="Cor da fonte">
              <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-base hover:bg-neutral-100">
                A
              </span>
              <input
                type="color"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => setTextColor(editor, e.target.value)}
              />
            </label>
            <label className="relative" title="Realçar">
              <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-base hover:bg-neutral-100">
                🖍
              </span>
              <input
                type="color"
                className="absolute inset-0 cursor-pointer opacity-0"
                defaultValue="#fff59d"
                onChange={(e) => setHighlight(editor, e.target.value)}
              />
            </label>
          </div>
        </div>
      </RibbonGroup>

      {/* Parágrafo */}
      <RibbonGroup label="Parágrafo">
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-0.5">
            <RibbonButton
              icon="•"
              title="Marcadores"
              active={isActive('bulletList')}
              onClick={() => toggleBulletList(editor)}
            />
            <RibbonButton
              icon="1."
              title="Numeração"
              active={isActive('orderedList')}
              onClick={() => toggleOrderedList(editor)}
            />
            <RibbonButton icon="⇤" title="Diminuir recuo" />
            <RibbonButton icon="⇥" title="Aumentar recuo" />
          </div>
          <div className="flex gap-0.5">
            <RibbonButton
              icon="⫷"
              title="Alinhar à esquerda (Ctrl+L)"
              active={editor.isActive({ textAlign: 'left' })}
              onClick={() => setTextAlign(editor, 'left')}
            />
            <RibbonButton
              icon="☰"
              title="Centralizar (Ctrl+E)"
              active={editor.isActive({ textAlign: 'center' })}
              onClick={() => setTextAlign(editor, 'center')}
            />
            <RibbonButton
              icon="⫸"
              title="Alinhar à direita (Ctrl+R)"
              active={editor.isActive({ textAlign: 'right' })}
              onClick={() => setTextAlign(editor, 'right')}
            />
            <RibbonButton
              icon="≡"
              title="Justificar (Ctrl+J)"
              active={editor.isActive({ textAlign: 'justify' })}
              onClick={() => setTextAlign(editor, 'justify')}
            />
          </div>
        </div>
      </RibbonGroup>

      {/* Estilos */}
      <RibbonGroup label="Estilos">
        <div className="flex gap-0.5">
          <button
            className={`h-12 w-16 rounded border px-1 text-xs ${
              !isActive('heading')
                ? 'border-blue-400 bg-blue-50'
                : 'border-neutral-200 bg-white'
            } hover:border-blue-300`}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            Normal
          </button>
          <button
            className={`h-12 w-16 rounded border px-1 text-xs font-bold ${
              isActive('heading') && editor.getAttributes('heading').level === 1
                ? 'border-blue-400 bg-blue-50'
                : 'border-neutral-200 bg-white'
            } hover:border-blue-300`}
            onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
          >
            Título 1
          </button>
          <button
            className={`h-12 w-16 rounded border px-1 text-xs ${
              isActive('heading') && editor.getAttributes('heading').level === 2
                ? 'border-blue-400 bg-blue-50'
                : 'border-neutral-200 bg-white'
            } hover:border-blue-300`}
            onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
          >
            Título 2
          </button>
        </div>
      </RibbonGroup>

      {/* Desfazer/Refazer */}
      <RibbonGroup label="Histórico">
        <div className="flex gap-0.5">
          <RibbonButton icon="↩" title="Desfazer (Ctrl+Z)" onClick={() => undo(editor)} />
          <RibbonButton icon="↪" title="Refazer (Ctrl+Y)" onClick={() => redo(editor)} />
        </div>
      </RibbonGroup>
    </div>
  )
}
