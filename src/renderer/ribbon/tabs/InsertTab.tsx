import { useEditorStore } from '../../stores/useEditorStore'
import { useDocumentLayoutStore } from '../../stores/useDocumentLayoutStore'
import { RibbonGroup } from '../RibbonGroup'
import { RibbonButton } from '../controls/RibbonButton'
import { Table, Image, Minus, SlidersHorizontal } from 'lucide-react'

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
    const blob = new Blob([result.bytes.buffer as ArrayBuffer], {
      type: `image/${result.ext?.replace('.', '') || 'png'}`
    })
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
        <RibbonButton
          icon={<Table className="h-5 w-5 text-office-blue" />}
          label="Tabela"
          size="lg"
          onClick={insertTable}
          title="Inserir tabela 3×3"
        />
      </RibbonGroup>

      <RibbonGroup label="Ilustrações">
        <RibbonButton
          icon={<Image className="h-5 w-5 text-emerald-600" />}
          label="Imagem"
          size="lg"
          onClick={insertImage}
          title="Inserir imagem do computador"
        />
      </RibbonGroup>

      <RibbonGroup label="Quebras">
        <RibbonButton
          icon={<Minus className="h-5 w-5 text-neutral-600" />}
          label="Quebra"
          size="lg"
          onClick={insertPageBreak}
          title="Inserir quebra de página"
        />
      </RibbonGroup>

      <RibbonGroup label="Configuração">
        <RibbonButton
          icon={<SlidersHorizontal className="h-5 w-5 text-neutral-600" />}
          label="Página"
          size="lg"
          onClick={() => setSetupDialogOpen(true)}
          title="Configuração de margens, tamanho e cabeçalho"
        />
      </RibbonGroup>
    </div>
  )
}
