import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'
import { useEditorStore } from '../../stores/useEditorStore'
import { useEditorUiStore } from '../../stores/useEditorUiStore'
import { openDocxIntoEditor } from '../../lib/open-docx'
import {
  FolderOpen,
  Clipboard,
  Scissors,
  Copy,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  Indent,
  Outdent,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Sparkles
} from 'lucide-react'
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
  indent,
  outdent,
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
  const { showStylesPane, toggleStylesPane } = useEditorUiStore()

  if (!editor) return <div className="h-[80px]" />

  const isActive = (name: string) => editor.isActive(name)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        editor.chain().focus().insertContent(text).run()
      }
    } catch {
      document.execCommand('paste')
    }
  }

  return (
    <div className="flex items-stretch gap-0">
      {/* Arquivo */}
      <RibbonGroup label="Arquivo">
        <RibbonButton
          icon={<FolderOpen className="h-5 w-5 text-amber-500" />}
          label="Abrir"
          size="lg"
          title="Abrir documento .docx (Ctrl+O)"
          onClick={() => void openDocxIntoEditor(editor)}
        />
      </RibbonGroup>

      {/* Área de Transferência */}
      <RibbonGroup label="Área de Transferência">
        <RibbonButton
          icon={<Clipboard className="h-5 w-5 text-office-blue" />}
          label="Colar"
          size="lg"
          title="Colar da área de transferência (Ctrl+V)"
          onClick={handlePaste}
        />
        <div className="flex flex-col">
          <RibbonButton
            icon={<Scissors className="h-3.5 w-3.5" />}
            title="Recortar (Ctrl+X)"
            onClick={() => document.execCommand('cut')}
          />
          <RibbonButton
            icon={<Copy className="h-3.5 w-3.5" />}
            title="Copiar (Ctrl+C)"
            onClick={() => document.execCommand('copy')}
          />
        </div>
      </RibbonGroup>

      {/* Fonte */}
      <RibbonGroup label="Fonte">
        <div className="flex items-center gap-1">
          <select
            className="h-7 w-32 rounded border border-neutral-300 px-1 text-xs focus:border-office-blue focus:outline-none"
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
            className="h-7 w-14 rounded border border-neutral-300 px-1 text-xs focus:border-office-blue focus:outline-none"
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
              icon={<Bold className="h-3.5 w-3.5" />}
              title="Negrito (Ctrl+B)"
              active={isActive('bold')}
              onClick={() => toggleBold(editor)}
            />
            <RibbonButton
              icon={<Italic className="h-3.5 w-3.5" />}
              title="Itálico (Ctrl+I)"
              active={isActive('italic')}
              onClick={() => toggleItalic(editor)}
            />
            <RibbonButton
              icon={<Underline className="h-3.5 w-3.5" />}
              title="Sublinhado (Ctrl+U)"
              active={isActive('underline')}
              onClick={() => toggleUnderline(editor)}
            />
            <RibbonButton
              icon={<Strikethrough className="h-3.5 w-3.5" />}
              title="Tachado"
              active={isActive('strike')}
              onClick={() => toggleStrike(editor)}
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="relative" title="Cor da fonte">
              <span className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-transparent font-serif text-sm font-bold text-neutral-800 hover:border-neutral-300 hover:bg-neutral-100">
                A
              </span>
              <input
                type="color"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => setTextColor(editor, e.target.value)}
              />
            </label>
            <label className="relative" title="Cor do realce (marca-texto)">
              <span className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-transparent hover:border-neutral-300 hover:bg-neutral-100">
                <Highlighter className="h-4 w-4 text-amber-500" />
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
              icon={<List className="h-3.5 w-3.5" />}
              title="Marcadores"
              active={isActive('bulletList')}
              onClick={() => toggleBulletList(editor)}
            />
            <RibbonButton
              icon={<ListOrdered className="h-3.5 w-3.5" />}
              title="Numeração"
              active={isActive('orderedList')}
              onClick={() => toggleOrderedList(editor)}
            />
            <RibbonButton
              icon={<Outdent className="h-3.5 w-3.5" />}
              title="Diminuir recuo"
              onClick={() => outdent(editor)}
            />
            <RibbonButton
              icon={<Indent className="h-3.5 w-3.5" />}
              title="Aumentar recuo"
              onClick={() => indent(editor)}
            />
          </div>
          <div className="flex gap-0.5">
            <RibbonButton
              icon={<AlignLeft className="h-3.5 w-3.5" />}
              title="Alinhar à esquerda (Ctrl+L)"
              active={editor.isActive({ textAlign: 'left' })}
              onClick={() => setTextAlign(editor, 'left')}
            />
            <RibbonButton
              icon={<AlignCenter className="h-3.5 w-3.5" />}
              title="Centralizar (Ctrl+E)"
              active={editor.isActive({ textAlign: 'center' })}
              onClick={() => setTextAlign(editor, 'center')}
            />
            <RibbonButton
              icon={<AlignRight className="h-3.5 w-3.5" />}
              title="Alinhar à direita (Ctrl+R)"
              active={editor.isActive({ textAlign: 'right' })}
              onClick={() => setTextAlign(editor, 'right')}
            />
            <RibbonButton
              icon={<AlignJustify className="h-3.5 w-3.5" />}
              title="Justificar (Ctrl+J)"
              active={editor.isActive({ textAlign: 'justify' })}
              onClick={() => setTextAlign(editor, 'justify')}
            />
          </div>
        </div>
      </RibbonGroup>

      {/* Estilos */}
      <RibbonGroup label="Estilos">
        <div className="flex items-center gap-1">
          <button
            className={`h-12 w-16 rounded border px-1 text-xs transition-colors ${
              !isActive('heading')
                ? 'border-blue-400 bg-blue-50 text-office-blue font-medium'
                : 'border-neutral-200 bg-white hover:border-blue-200'
            }`}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            Normal
          </button>
          <button
            className={`h-12 w-16 rounded border px-1 text-xs font-bold transition-colors ${
              isActive('heading') && editor.getAttributes('heading').level === 1
                ? 'border-blue-400 bg-blue-50 text-office-blue'
                : 'border-neutral-200 bg-white hover:border-blue-200'
            }`}
            onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
          >
            Título 1
          </button>
          <button
            className={`h-12 w-16 rounded border px-1 text-xs transition-colors ${
              isActive('heading') && editor.getAttributes('heading').level === 2
                ? 'border-blue-400 bg-blue-50 text-office-blue font-semibold'
                : 'border-neutral-200 bg-white hover:border-blue-200'
            }`}
            onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
          >
            Título 2
          </button>
          <RibbonButton
            icon={<Sparkles className="h-4 w-4 text-office-blue" />}
            label="Painel"
            size="lg"
            active={showStylesPane}
            onClick={toggleStylesPane}
            title="Abrir painel lateral de estilos"
          />
        </div>
      </RibbonGroup>

      {/* Histórico */}
      <RibbonGroup label="Histórico">
        <div className="flex gap-0.5">
          <RibbonButton
            icon={<Undo2 className="h-4 w-4" />}
            title="Desfazer (Ctrl+Z)"
            onClick={() => undo(editor)}
          />
          <RibbonButton
            icon={<Redo2 className="h-4 w-4" />}
            title="Refazer (Ctrl+Y)"
            onClick={() => redo(editor)}
          />
        </div>
      </RibbonGroup>
    </div>
  )
}
