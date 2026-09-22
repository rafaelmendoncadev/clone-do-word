import { useEditorStore } from '../../stores/useEditorStore'
import { useDocumentLayoutStore } from '../../stores/useDocumentLayoutStore'
import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'

export function InsertTab() {
  const editor = useEditorStore((s) => s.editor)
  const setSetupDialogOpen = useDocumentLayoutStore((s) => s.setSetupDialogOpen)

  if (!editor) return <div className="h-[80px]" />

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const insertImage = async () => {
    const result = await window.api?.dialog.pickImage()
    if (!result) return
    const blob = new Blob([result.bytes.buffer as ArrayBuffer], { type: `image/${result.ext?.replace('.', '') || 'png'}` })
    const reader = new FileReader()
    reader.onload = () => editor.chain().focus().setImage({ src: reader.result as string }).run()
    reader.readAsDataURL(blob)
  }

  const insertPageBreak = () => {
    editor.chain().focus().setHorizontalRule().run()
  }

  return (
    <div className="flex items-stretch gap-0">
      <RibbonGroup label="Tabelas">
        <RibbonButton icon="⊞" label="Tabela" size="lg" onClick={insertTable} title="Inserir tabela 3×3" />
      </RibbonGroup>
      <RibbonGroup label="Ilustrações">
        <RibbonButton icon="🖼" label="Imagem" size="lg" onClick={insertImage} title="Inserir imagem" />
      </RibbonGroup>
      <RibbonGroup label="Quebras">
        <RibbonButton icon="⤓" label="Quebra" size="lg" onClick={insertPageBreak} title="Quebra de página" />
      </RibbonGroup>
      <RibbonGroup label="Página">
        <RibbonButton icon="📐" label="Configurar" size="lg" onClick={() => setSetupDialogOpen(true)} title="Configurar página" />
      </RibbonGroup>
    </div>
  )
}
